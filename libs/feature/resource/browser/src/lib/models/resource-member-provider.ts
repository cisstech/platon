import { ListResponse } from '@platon/core/common'
import { Resource, ResourceMember, ResourceMemberFilters, UpdateResourceMember } from '@platon/feature/resource/common'
import { Observable } from 'rxjs'

export abstract class ResourceMemberProvider {
  abstract join(resource: Resource | string): Observable<ResourceMember>
  abstract find(resource: Resource | string, userId: string): Observable<ResourceMember>
  abstract update(resource: Resource | string, userId: string, input: UpdateResourceMember): Observable<ResourceMember>
  abstract delete(resource: Resource | string, userId: string): Observable<void>
  abstract search(resource: Resource | string, filters: ResourceMemberFilters): Observable<ListResponse<ResourceMember>>
}
