import { Observable } from 'rxjs'

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

@Injectable({ providedIn: 'root' })
export class ResourceFileService {
  constructor(private readonly provider: ResourceFileProvider) {}

  compile(resource: string, version?: string): Observable<PLSourceFile> {
    return this.provider.compile(resource, version)
  }

  release(resource: string | Resource, input: FileRelease): Observable<void> {
    return this.provider.release(resource, input)
  }

  versions(resource: Resource): Observable<FileVersions> {
    return this.provider.versions(resource)
  }

  tree(resource: string | Resource, version?: string): Observable<ResourceFile> {
    return this.provider.tree(resource, version)
  }

  read(resource: string | Resource, path: string, version?: string): Observable<ResourceFile> {
    return this.provider.read(resource, path, version)
  }

  create(resource: string | Resource, input: FileCreate[]): Observable<void> {
    return this.provider.create(resource, input)
  }

  upload(file: ResourceFile, data: File): Observable<void> {
    return this.provider.upload(file, data)
  }

  delete(file: ResourceFile): Observable<void> {
    return this.provider.delete(file)
  }

  move(file: ResourceFile, input: FileMove): Observable<void> {
    return this.provider.move(file, input)
  }

  update(file: ResourceFile, input: FileUpdate): Observable<void> {
    return this.provider.update(file, input)
  }

  search(file: ResourceFile, query: FileSearch): Observable<FileSearchResults> {
    return this.provider.search(file, query)
  }
}
