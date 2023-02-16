import { Observable } from "rxjs";

import { FileCreate, FileMove, FileRelease, FileSearch, FileSearchResults, FileUpdate, FileVersions, Resource, ResourceFile } from "@platon/feature/resource/common";

export abstract class FileProvider {
  abstract release(resource: string | Resource, input: FileRelease): Observable<void>;
  abstract versions(resource: string | Resource): Observable<FileVersions>;
  abstract tree(resource: string | Resource, version?: string): Observable<ResourceFile>;
  abstract read(resource: string | Resource, path: string): Observable<ResourceFile>;

  abstract delete(file: ResourceFile): Observable<void>;
  abstract create(file: ResourceFile, input: FileCreate): Observable<void>;
  abstract move(file: ResourceFile, input: FileMove): Observable<void>;
  abstract update(file: ResourceFile, input: FileUpdate): Observable<void>;
  abstract search(file: ResourceFile, query: FileSearch): Observable<FileSearchResults>;
}
