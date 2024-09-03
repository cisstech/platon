import { Observable } from 'rxjs'

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

export abstract class ResourceFileProvider {
  abstract compileExercise(resource: string, version?: string): Observable<PLSourceFile>
  abstract transformExercise(resource: string, input: ExerciseTransformInput, version?: string): Observable<string>

  abstract release(resource: string | Resource, input: FileRelease): Observable<void>
  abstract versions(resource: string | Resource): Observable<FileVersions>
  abstract tree(resource: string | Resource, version?: string): Observable<ResourceFile>
  abstract read(resource: string | Resource, path: string, version?: string): Observable<ResourceFile>
  abstract create(resource: string | Resource, input: FileCreate[]): Observable<void>

  abstract upload(file: Pick<ResourceFile, 'url'>, data: File): Observable<void>
  abstract delete(file: Pick<ResourceFile, 'url'>): Observable<void>
  abstract move(file: Pick<ResourceFile, 'url'>, input: FileMove): Observable<void>
  abstract update(file: Pick<ResourceFile, 'url'>, input: FileUpdate): Observable<void>
  abstract search(file: Pick<ResourceFile, 'url'>, query: FileSearch): Observable<FileSearchResults>
  abstract listZipFiles(file: ResourceFile): Observable<string[]>
  abstract unzipFile(file: ResourceFile, path: string): Observable<void>
  abstract log(resource: string | Resource): Observable<GitLogResult[]>
}
