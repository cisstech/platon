import { map, Observable } from 'rxjs'

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import {
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
import { PLSourceFile } from '@platon/feature/compiler'

@Injectable()
export class RemoteResourceFileProvider extends ResourceFileProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  compile(resource: string, version?: string): Observable<PLSourceFile> {
    let params = new HttpParams()
    if (version) {
      params = params.append('version', version)
    }

    return this.http
      .post<PLSourceFile>(`/api/v1/files/compile/${resource}`, {
        params,
      })
      .pipe(map((response) => response))
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
    return this.http.get<ResourceFile>(`/api/v1/files/${id}/${path}`, {
      params: new HttpParams().set('version', version || 'latest'),
    })
  }

  create(resource: string | Resource, input: FileCreate[]): Observable<void> {
    const id = typeof resource === 'string' ? resource : resource.id
    return this.http.post<void>(`/api/v1/files/${id}/`, input)
  }

  upload(file: ResourceFile, data: File): Observable<void> {
    const formData = new FormData()
    formData.append('file', data, data.name)
    const headers = new HttpHeaders()
    headers.set('Content-Type', 'null')
    headers.set('Accept', 'multipart/form-data')
    return this.http.post<void>(file.url, formData, {
      headers: headers,
    })
  }

  delete(file: ResourceFile): Observable<void> {
    return this.http.delete<void>(file.url)
  }

  move(file: ResourceFile, input: FileMove): Observable<void> {
    return this.http.patch<void>(file.url, input)
  }

  update(file: ResourceFile, input: FileUpdate): Observable<void> {
    return this.http.put<void>(file.url, input)
  }

  search(file: ResourceFile, query: FileSearch): Observable<FileSearchResults> {
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
}
