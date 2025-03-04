import { ExpandableModel, ListResponse, User } from '@platon/core/common'
import {
  CircleTree,
  CreatePreviewResource,
  CreateResource,
  FindResource,
  Resource,
  ResourceCompletion,
  ResourceExpandableFields,
  ResourceFilters,
  UpdateResource,
} from '@platon/feature/resource/common'
import { Observable } from 'rxjs'

export interface ResourceFindOptions {
  markAsView?: boolean
  expands?: ResourceExpandableFields[]
}

export abstract class ResourceProvider {
  abstract tree(): Observable<CircleTree>
  abstract circle(username: string, expands?: ExpandableModel): Observable<Resource>
  abstract completion(): Observable<ResourceCompletion>
  abstract search(filters?: ResourceFilters): Observable<ListResponse<Resource>>
  abstract find(input: FindResource): Observable<Resource>
  abstract update(id: string, input: UpdateResource): Observable<Resource>
  abstract create(input: CreateResource): Observable<Resource>
  abstract createPreview(input: CreatePreviewResource): Observable<Resource>
  abstract move(id: string, parentId: string): Observable<Resource>
  abstract moveToOwnerCircle(resource: Resource): Observable<Resource>
  abstract delete(resource: Resource): Observable<void>
  abstract listOwners(): Observable<User[]>
}
