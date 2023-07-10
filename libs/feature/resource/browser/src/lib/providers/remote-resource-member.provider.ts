import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ItemResponse, ListResponse } from '@platon/core/common'
import { Resource, ResourceMember, ResourceMemberFilters } from '@platon/feature/resource/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ResourceMemberProvider } from '../models/resource-member-provider'

@Injectable()
export class RemoteResourceMemberProvider extends ResourceMemberProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  findMember(resource: Resource, userId: string): Observable<ResourceMember> {
    return this.http
      .get<ItemResponse<ResourceMember>>(`/api/v1/resources/${resource.id}/members/${userId}`)
      .pipe(map((response) => response.resource))
  }

  deleteMember(resource: Resource, userId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/resources/${resource.id}/members/${userId}`)
  }

  searchMembers(resource: Resource, filters: ResourceMemberFilters): Observable<ListResponse<ResourceMember>> {
    let params = new HttpParams()
    if (filters.search) {
      params = params.append('search', filters.search)
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString())
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString())
    }

    if (filters.order) {
      params = params.append('order', filters.order.toString())
    }

    return this.http.get<ListResponse<ResourceMember>>(`/api/v1/resources/${resource.id}/members`, {
      params,
    })
  }
}
