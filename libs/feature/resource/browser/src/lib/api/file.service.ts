import { Observable } from 'rxjs'

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
  GitLogResult,
  Resource,
  ResourceFile,
} from '@platon/feature/resource/common'
import { ResourceFileProvider } from '../models/resource-file-provider'

@Injectable({ providedIn: 'root' })
export class ResourceFileService {
  constructor(private readonly provider: ResourceFileProvider) {}

  compileExercise(resource: string, version?: string): Observable<PLSourceFile> {
    return this.provider.compileExercise(resource, version)
  }

  transformExercise(resource: string, input: ExerciseTransformInput, version?: string): Observable<string> {
    return this.provider.transformExercise(resource, input, version)
  }

  release(resource: string | Resource, input: FileRelease): Observable<void> {
    return this.provider.release(resource, input)
  }

  versions(resource: string | Resource): Observable<FileVersions> {
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

  upload(file: Pick<ResourceFile, 'url'>, data: File): Observable<void> {
    return this.provider.upload(file, data)
  }

  delete(file: Pick<ResourceFile, 'url'>): Observable<void> {
    return this.provider.delete(file)
  }

  move(file: Pick<ResourceFile, 'url'>, input: FileMove): Observable<void> {
    return this.provider.move(file, input)
  }

  update(file: Pick<ResourceFile, 'url'>, input: FileUpdate): Observable<void> {
    return this.provider.update(file, input)
  }

  listZipFiles(file: ResourceFile): Observable<string[]> {
    return this.provider.listZipFiles(file)
  }

  unzipFile(file: ResourceFile, path: string): Observable<void> {
    return this.provider.unzipFile(file, path)
  }

  search(file: Pick<ResourceFile, 'url'>, query: FileSearch): Observable<FileSearchResults> {
    return this.provider.search(file, query)
  }

  log(resource: string | Resource): Observable<GitLogResult[]> {
    return this.provider.log(resource)
  }
}
