import { map, Observable } from 'rxjs'

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { PLSourceFile } from '@platon/feature/compiler'
import {
  ExerciseTransformInput,
  FileCreate,
  FileMove,
  FileRelease,
  FileSearch,
  FileSearchResults,
  FileUpdate,
  FileVersions,
  Resource,
  ResourceFile,
} from '@platon/feature/resource/common'
import { ResourceFileProvider } from '../models/resource-file-provider'
import { ReadCommitResult } from 'isomorphic-git'

@Injectable()
export class RemoteResourceFileProvider extends ResourceFileProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  compileExercise(resource: string, version?: string): Observable<PLSourceFile> {
    let params = new HttpParams()
    if (version) {
      params = params.append('version', version)
    }

    return this.http.post<PLSourceFile>(`/api/v1/files/compile/${resource}/json`, {
      params,
    })
  }

  transformExercise(resource: string, input: ExerciseTransformInput, version?: string): Observable<string> {
    let params = new HttpParams()
    if (version) {
      params = params.append('version', version)
    }
    return this.http.post<string>(`/api/v1/files/compile/${resource}/text`, input, {
      params,
      responseType: 'text' as 'json',
    })
  }

  release(resource: string | Resource, input: FileRelease): Observable<void> {
    const id = typeof resource === 'string' ? resource : resource.id
    return this.http.post<void>(`/api/v1/files/release/${id}`, input)
  }

  versions(resource: string | Resource): Observable<FileVersions> {
    const id = typeof resource === 'string' ? resource : resource.id
    return this.http.get<FileVersions>(`/api/v1/files/${id}/`, {
      params: new HttpParams().set('versions', 'true'),
    })
  }

  tree(resource: string | Resource, version?: string): Observable<ResourceFile> {
    let params = new HttpParams()
    if (version) {
      params = params.set('version', version)
    }
    const id = typeof resource === 'string' ? resource : resource.id
    return this.http.get<ResourceFile>(`/api/v1/files/${id}/`, { params }).pipe(map((res) => res))
  }

  read(resource: string | Resource, path: string, version?: string): Observable<ResourceFile> {
    const id = typeof resource === 'string' ? resource : resource.id
    let params = new HttpParams()
    params = params.set('version', version || 'latest')
    params = params.set('stat', 'true')
    return this.http.get<ResourceFile>(`/api/v1/files/${id}/${path}`, { params })
  }

  create(resource: string | Resource, input: FileCreate[]): Observable<void> {
    const id = typeof resource === 'string' ? resource : resource.id
    return this.http.post<void>(`/api/v1/files/${id}/`, input)
  }

  upload(file: Pick<ResourceFile, 'url'>, data: File): Observable<void> {
    const formData = new FormData()
    formData.append('file', data, data.name)
    const headers = new HttpHeaders()
    headers.set('Content-Type', 'null')
    headers.set('Accept', 'multipart/form-data')
    return this.http.post<void>(file.url, formData, {
      headers: headers,
    })
  }

  delete(file: Pick<ResourceFile, 'url'>): Observable<void> {
    return this.http.delete<void>(file.url)
  }

  move(file: Pick<ResourceFile, 'url'>, input: FileMove): Observable<void> {
    return this.http.patch<void>(file.url, input)
  }

  update(file: Pick<ResourceFile, 'url'>, input: FileUpdate): Observable<void> {
    return this.http.put<void>(file.url, input)
  }

  search(file: Pick<ResourceFile, 'url'>, query: FileSearch): Observable<FileSearchResults> {
    let params = new HttpParams()
    params = params.set('search', query.search)
    Object.keys(query).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params = params.set(key, (query as any)[key])
    })
    return this.http.get<FileSearchResults>(file.url, {
      params,
    })
  }

  listZipFiles(file: Pick<ResourceFile, 'url'>): Observable<string[]> {
    let params = new HttpParams()
    params = params.set('zipList', 'true')
    return this.http.get<string[]>(file.url, {
      params,
    })
  }

  unzipFile(zipFile: Pick<ResourceFile, 'url'>, file: string): Observable<void> {
    return this.http.patch<void>(zipFile.url, { unzip: true, unzipFile: file })
  }

  log(resource: string | Resource): Observable<ReadCommitResult[]> {
    const id = typeof resource === 'string' ? resource : resource.id
    return this.http.get<ReadCommitResult[]>(`/api/v1/files/log/${id}`)
  }
}
