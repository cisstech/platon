import { Observable } from "rxjs";

import { FileCreate, FileMove, FileRelease, FileSearch, FileSearchResults, FileUpdate, FileVersions, Resource, ResourceFile } from "@platon/feature/resource/common";

export abstract class ResourceFileProvider {
  abstract release(resource: string | Resource, input: FileRelease): Observable<void>;
  abstract versions(resource: string | Resource): Observable<FileVersions>;
  abstract tree(resource: string | Resource, version?: string): Observable<ResourceFile>;
  abstract read(resource: string | Resource, path: string, version?: string): Observable<ResourceFile>;
  abstract create(resource: string | Resource, input: FileCreate[]): Observable<void>;

  abstract upload(file: ResourceFile, data: File): Observable<void>;
  abstract delete(file: ResourceFile): Observable<void>;
  abstract move(file: ResourceFile, input: FileMove): Observable<void>;
  abstract update(file: ResourceFile, input: FileUpdate): Observable<void>;
  abstract search(file: ResourceFile, query: FileSearch): Observable<FileSearchResults>;
}
