import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileSystemError, FileSystemProvider, FileSystemProviderCapabilities, IFile, Paths, SearchForm, SearchResult } from '@cisstech/nge-ide/core';
import { FileService } from '@platon/feature/resource/browser';
import { FileTypes, ResourceFile } from '@platon/feature/resource/common';
import { firstValueFrom } from 'rxjs';

const removeLeadingSlash = (path: string) => path.replace(/^[\\/.]+/g, '');

class FileImpl implements IFile {
  readonly uri: monaco.Uri;
  readonly version: string;
  readonly readOnly: boolean;
  readonly isFolder: boolean;
  readonly url: string;

  constructor(
    entry: ResourceFile,
  ) {
    const path = Paths.normalize(entry.path);
    this.uri = monaco.Uri.parse(`file:///${removeLeadingSlash(path)}`);
    this.version = entry.version;
    this.readOnly = false;
    this.isFolder = entry.type === 'folder';
    this.url = entry.downloadUrl;
  }
}


@Injectable({ providedIn: 'root' })
export class RemoteFileSystemProvider extends FileSystemProvider {
  private readonly entries = new Map<string, ResourceFile>();
  private readonly resourceId = this.activatedRoute.snapshot.paramMap.get('id') as string;

  readonly scheme = 'file';

  readonly capabilities = FileSystemProviderCapabilities.FileRead |
    FileSystemProviderCapabilities.FileWrite |
    FileSystemProviderCapabilities.FileMove |
    FileSystemProviderCapabilities.FileDelete |
    FileSystemProviderCapabilities.FileSearch |
    FileSystemProviderCapabilities.FileUpload;

  constructor(
    private readonly http: HttpClient,
    private readonly fileService: FileService,
    private readonly activatedRoute: ActivatedRoute,
  ) {
    super()
  }

  listFolders() {
    return [
      {
        name: '/',
        uri: monaco.Uri.parse(`${this.scheme}:///`)
      }
    ]
  }

  override async readDirectory(uri: monaco.Uri): Promise<IFile[]> {
    this.entries.clear();
    const path = removeLeadingSlash(uri.path);
    const tree = await firstValueFrom(this.fileService.read(this.resourceId, path));
    const files: IFile[] = [];
    const transform = (entry: ResourceFile) => {
      const file = new FileImpl(entry);
      files.push(file);
      this.entries.set(file.uri.toString(true), entry);
      entry.children?.forEach(transform);
    };
    transform(tree);
    return files;
  }

  override async createDirectory(uri: monaco.Uri): Promise<void> {
    this.lookupParentDirectory(uri);
    const file = this.lookup(uri, true);
    if (file) {
      throw FileSystemError.FileExists(uri);
    }

    await firstValueFrom(
      this.fileService.create(this.resourceId, [{
        path: removeLeadingSlash(uri.path),
      }])
    );
  }

  override async upload(file: File, destination: monaco.Uri): Promise<void> {
    const dest = this.lookupAsDirectory(destination);
    await firstValueFrom(
      this.fileService.upload(dest, file)
    );
  }

  override async read(uri: monaco.Uri): Promise<string> {
    const file = this.lookup(uri);
    const content = await firstValueFrom(this.http.get<string>(file.url, {
      responseType: 'text' as 'json'
    }));
    return content;
  }

  override async write(uri: monaco.Uri, content: string, update: boolean): Promise<void> {
    if (update) {
      const file = this.lookup(uri);
      await firstValueFrom(this.fileService.update(file, { content }));
    } else {
      await firstValueFrom(
        this.fileService.create(this.resourceId, [{
          path: removeLeadingSlash(uri.path),
          content
        }])
      );
    }
  }

  override async delete(uri: monaco.Uri): Promise<void> {
    const file = this.lookup(uri);
    await firstValueFrom(
      this.fileService.delete(file)
    );
  }

  override async rename(uri: monaco.Uri, name: string): Promise<void> {
    const file = this.lookup(uri);
    await firstValueFrom(
      this.fileService.move(
        file, {
        destination: removeLeadingSlash(
          Paths.join([Paths.dirname(uri.path), name])
        ),
        rename: true
      }
      )
    )
  }

  override async move(source: monaco.Uri, destination: monaco.Uri, options: { copy: boolean; }): Promise<void> {
    const src = this.lookup(source);
    this.lookupAsDirectory(destination);

    await firstValueFrom(
      this.fileService.move(src, {
        destination: removeLeadingSlash(destination.path),
        copy: options?.copy
      })
    );

  }

  override async search(uri: monaco.Uri, form: SearchForm): Promise<SearchResult<monaco.Uri>[]> {
    const file = this.lookup(uri);

    const response = await firstValueFrom(
      this.fileService.search(file, {
        search: form.query,
        match_case: form.matchCase,
        match_word: form.matchWord,
        use_regex: form.useRegex,
      })
    )

    const results = Object.keys(response.results).map(path => ({
      entry: monaco.Uri.parse(`${this.scheme}:///${removeLeadingSlash(path)}`),
      matches: response.results[path].map((match) => ({
        lineno: match.line,
        match: match.preview
      }))
    }) as SearchResult<monaco.Uri>);

    return results;
  }

  private lookup(uri: monaco.Uri, silent = false): ResourceFile {
    const entry = this.entries.get(uri.toString(true));
    if (!entry && !silent) {
      throw FileSystemError.FileNotFound(uri);
    }
    return entry as ResourceFile;
  }

  private lookupAsDirectory(uri: monaco.Uri, silent = false): ResourceFile {
    const entry = this.lookup(uri, silent);
    if (entry && entry.type == FileTypes.folder) {
      return entry;
    }
    throw FileSystemError.FileNotADirectory(uri);
  }

  private lookupAsFile(uri: monaco.Uri): ResourceFile {
    const entry = this.lookup(uri, false);
    if (entry && entry.type == FileTypes.file) {
      return entry;
    }
    throw FileSystemError.FileIsADirectory(uri);
  }

  private lookupParentDirectory(uri: monaco.Uri): ResourceFile {
    const dirname = uri.with({ path: Paths.dirname(uri.path) });
    return this.lookupAsDirectory(dirname, false);
  }
}
