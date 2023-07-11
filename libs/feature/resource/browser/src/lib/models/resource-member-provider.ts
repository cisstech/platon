import { ListResponse } from '@platon/core/common'
import { Resource, ResourceMember, ResourceMemberFilters } from '@platon/feature/resource/common'
import { Observable } from 'rxjs'

export abstract class ResourceMemberProvider {
  abstract findMember(resource: Resource, userId: string): Observable<ResourceMember>
  abstract deleteMember(resource: Resource, userId: string): Observable<void>
  abstract searchMembers(resource: Resource, filters: ResourceMemberFilters): Observable<ListResponse<ResourceMember>>
}
