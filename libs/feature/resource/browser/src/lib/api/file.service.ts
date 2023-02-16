import { Observable } from "rxjs";

import { Injectable } from "@angular/core";
import { FileCreate, FileMove, FileRelease, FileSearch, FileSearchResults, FileUpdate, FileVersions, Resource, ResourceFile } from "@platon/feature/resource/common";
import { FileProvider } from "../models/file-provider";

@Injectable({ providedIn: 'root' })
export class FileService {

  constructor(private readonly provider: FileProvider) {
  }

  release(resource: string | Resource, input: FileRelease): Observable<void> {
    return this.provider.release(resource, input);
  }

  versions(resource: Resource): Observable<FileVersions> {
    return this.provider.versions(resource);
  }

  tree(resource: string | Resource, version?: string): Observable<ResourceFile> {
    return this.provider.tree(resource, version);
  }

  read(resource: string | Resource, path: string): Observable<ResourceFile> {
    return this.provider.read(resource, path);
  }

  delete(file: ResourceFile): Observable<void> {
    return this.provider.delete(file);
  }

  create(file: ResourceFile, input: FileCreate): Observable<void> {
    return this.provider.create(file, input);
  }

  move(file: ResourceFile, input: FileMove): Observable<void> {
    return this.provider.move(file, input);
  }

  update(file: ResourceFile, input: FileUpdate): Observable<void> {
    return this.provider.update(file, input);
  }

  search(file: ResourceFile, query: FileSearch): Observable<FileSearchResults> {
    return this.provider.search(file, query);

  }
}
