import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ItemResponse, ListResponse } from '@platon/core/common'
import { Resource, ResourceMember, ResourceMemberFilters, UpdateResourceMember } from '@platon/feature/resource/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ResourceMemberProvider } from '../models/resource-member-provider'

const getId = (resource: Resource | string): string => {
  return typeof resource === 'string' ? resource : resource.id
}

@Injectable()
export class RemoteResourceMemberProvider extends ResourceMemberProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  join(resource: Resource | string): Observable<ResourceMember> {
    return this.http
      .post<ItemResponse<ResourceMember>>(`/api/v1/resources/${getId(resource)}/members`, {})
      .pipe(map((response) => response.resource))
  }

  update(resource: Resource | string, userId: string, input: UpdateResourceMember): Observable<ResourceMember> {
    return this.http
      .patch<ItemResponse<ResourceMember>>(`/api/v1/resources/${getId(resource)}/members/${userId}`, input)
      .pipe(map((response) => response.resource))
  }

  find(resource: Resource | string, userId: string): Observable<ResourceMember> {
    return this.http
      .get<ItemResponse<ResourceMember>>(`/api/v1/resources/${getId(resource)}/members/${userId}`)
      .pipe(map((response) => response.resource))
  }

  delete(resource: Resource | string, userId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/resources/${getId(resource)}/members/${userId}`)
  }

  search(resource: Resource, filters: ResourceMemberFilters): Observable<ListResponse<ResourceMember>> {
    let params = new HttpParams()
    if (filters.search) {
      params = params.append('search', filters.search)
    }

    if (filters.waiting != null) {
      params = params.append('waiting', filters.waiting.toString())
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
