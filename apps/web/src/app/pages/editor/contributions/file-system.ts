import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import {
  FileSystemError,
  FileSystemProvider,
  FileSystemProviderCapabilities,
  IFile,
  Paths,
  SearchForm,
  SearchResult,
} from '@cisstech/nge-ide/core'
import { removeLeadingSlash } from '@platon/core/common'
import { ResourceFileService } from '@platon/feature/resource/browser'
import { FileTypes, ResourceFile } from '@platon/feature/resource/common'
import { firstValueFrom } from 'rxjs'

export class ResourceFileImpl implements IFile {
  readonly uri: monaco.Uri
  readonly version: string
  readonly readOnly: boolean
  readonly isFolder: boolean
  readonly url: string

  readonly resourceFile: ResourceFile

  constructor(uri: monaco.Uri, entry: ResourceFile) {
    this.uri = uri
    this.version = entry.version
    this.readOnly = !!entry.readOnly
    this.isFolder = entry.type === 'folder'
    this.url = entry.downloadUrl

    this.resourceFile = entry
  }
}

export const PLATON_SCHEME = 'platon'

@Injectable()
export class ResourceFileSystemProvider extends FileSystemProvider {
  private readonly http = inject(HttpClient)
  private readonly fileService = inject(ResourceFileService)
  private readonly entries = new Map<string, ResourceFile>()

  readonly scheme = PLATON_SCHEME

  capabilities =
    FileSystemProviderCapabilities.FileRead |
    FileSystemProviderCapabilities.FileWrite |
    FileSystemProviderCapabilities.FileMove |
    FileSystemProviderCapabilities.FileDelete |
    FileSystemProviderCapabilities.FileSearch |
    FileSystemProviderCapabilities.FileUpload |
    FileSystemProviderCapabilities.FileStat

  constructor() {
    super()
  }

  cleanUp() {
    this.entries.clear()
  }

  /**
   *  Build a uri for the given resource file path
   * @param resource Resource id of code
   * @param version Version of the resource
   * @param path Path of the file
   * @returns
   */
  buildUri(resource: string, version = 'latest', path?: string) {
    resource = removeLeadingSlash(resource)
    path = path ? removeLeadingSlash(path) : ''
    return monaco.Uri.parse(`${this.scheme}://${resource}:${version}/${path}`)
  }

  removeDirectory(uri: monaco.Uri) {
    const prefix = uri.toString(true)
    const keys = Array.from(this.entries.keys()).filter((k) => k.startsWith(prefix))
    keys.forEach((k) => this.entries.delete(k))
  }

  override async stat(uri: monaco.Uri): Promise<IFile> {
    const { resource, version, path } = this.parseUri(uri)
    const file = await firstValueFrom(this.fileService.read(resource, path, version))
    if (!file) {
      throw FileSystemError.FileNotFound(uri)
    }

    const files: IFile[] = []
    this.adaptEntry(uri, file, files)
    return files[0]
  }

  override async readDirectory(uri: monaco.Uri): Promise<IFile[]> {
    this.removeDirectory(uri)

    const { resource, version, path } = this.parseUri(uri)

    const tree = await firstValueFrom(this.fileService.read(resource, path, version))
    const files: IFile[] = []

    this.adaptEntry(uri, tree, files)

    return files
  }

  override async createDirectory(uri: monaco.Uri): Promise<void> {
    this.lookupParentDirectory(uri)

    const file = this.lookup(uri, true)
    if (file) {
      throw FileSystemError.FileExists(uri)
    }

    const { resource, path } = this.parseUri(uri)

    await firstValueFrom(this.fileService.create(resource, [{ path }]))
  }

  override async upload(file: File, destination: monaco.Uri): Promise<void> {
    const dest = this.lookupAsDirectory(destination)
    await firstValueFrom(this.fileService.upload(dest, file))
  }

  override async read(uri: monaco.Uri): Promise<string> {
    const file = this.lookup(uri)
    const content = await firstValueFrom(this.http.get<string>(file.url, { responseType: 'text' as 'json' }))
    return content
  }

  override async write(uri: monaco.Uri, content: string, update: boolean): Promise<void> {
    if (update) {
      const file = this.lookup(uri)
      await firstValueFrom(this.fileService.update(file, { content }))
    } else {
      const { resource, path } = this.parseUri(uri)
      await firstValueFrom(this.fileService.create(resource, [{ path, content }]))
    }
  }

  override async delete(uri: monaco.Uri): Promise<void> {
    const file = this.lookup(uri)
    await firstValueFrom(this.fileService.delete(file))
  }

  override async rename(uri: monaco.Uri, name: string): Promise<void> {
    const file = this.lookup(uri)
    await firstValueFrom(
      this.fileService.move(file, {
        destination: removeLeadingSlash(Paths.join([Paths.dirname(uri.path), name])),
        rename: true,
      })
    )
  }

  override async move(source: monaco.Uri, destination: monaco.Uri, options: { copy: boolean }): Promise<void> {
    const src = this.lookup(source)
    this.lookupAsDirectory(destination)

    await firstValueFrom(
      this.fileService.move(src, {
        destination: removeLeadingSlash(destination.path),
        copy: options?.copy,
      })
    )
  }

  override async search(uri: monaco.Uri, form: SearchForm): Promise<SearchResult<monaco.Uri>[]> {
    const file = this.lookup(uri)

    const response = await firstValueFrom(
      this.fileService.search(file, {
        search: form.query,
        match_case: form.matchCase,
        match_word: form.matchWord,
        use_regex: form.useRegex,
      })
    )

    const { scheme, authority } = uri

    const results = Object.keys(response.results).map(
      (path) =>
        ({
          entry: monaco.Uri.parse(`${scheme}://${authority}/${removeLeadingSlash(path)}`),
          matches: response.results[path].map((match) => ({
            lineno: match.line,
            match: match.preview,
          })),
        } as SearchResult<monaco.Uri>)
    )

    return results
  }

  lookup(uri: monaco.Uri, silent = false): ResourceFile {
    const entry = this.entries.get(uri.toString(true))
    if (!entry && !silent) {
      throw FileSystemError.FileNotFound(uri)
    }
    return entry as ResourceFile
  }

  lookupAsDirectory(uri: monaco.Uri, silent = false): ResourceFile {
    const entry = this.lookup(uri, silent)
    if (entry && entry.type == FileTypes.folder) {
      return entry
    }
    throw FileSystemError.FileNotADirectory(uri)
  }

  lookupAsFile(uri: monaco.Uri): ResourceFile {
    const entry = this.lookup(uri, false)
    if (entry && entry.type == FileTypes.file) {
      return entry
    }
    throw FileSystemError.FileIsADirectory(uri)
  }

  private lookupParentDirectory(uri: monaco.Uri): ResourceFile {
    const dirname = uri.with({ path: Paths.dirname(uri.path) })
    return this.lookupAsDirectory(dirname, false)
  }

  private parseUri(uri: monaco.Uri) {
    const { authority, path } = uri
    const [resource, version] = authority.split(':')
    return {
      resource,
      version,
      path: removeLeadingSlash(path),
    }
  }

  private adaptEntry(uri: monaco.Uri, entry: ResourceFile, files: IFile[]) {
    const fileUri = monaco.Uri.parse(`${uri.scheme}://${uri.authority}/${removeLeadingSlash(entry.path)}`)
    const file = new ResourceFileImpl(fileUri, entry)
    files.push(file)
    this.entries.set(file.uri.toString(true), entry)
    entry.children?.forEach((child) => this.adaptEntry(uri, child, files))
  }
}
