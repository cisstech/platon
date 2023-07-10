import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ItemResponse, ListResponse, User } from '@platon/core/common'
import {
  CircleTree,
  CreateResource,
  CreateResourceInvitation,
  Resource,
  ResourceCompletion,
  ResourceEvent,
  ResourceEventFilters,
  ResourceFilters,
  ResourceInvitation,
  ResourceMember,
  ResourceMemberFilters,
  ResourceStatisic,
  ResourceWatcherFilters,
  UpdateResource,
} from '@platon/feature/resource/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ResourceProvider } from '../models/resource-provider'

@Injectable()
export class RemoteResourceProvider extends ResourceProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  tree(): Observable<CircleTree> {
    return this.http
      .get<ItemResponse<CircleTree>>('/api/v1/resources/tree')
      .pipe(map((response) => response.resource))
  }

  circle(username: string): Observable<Resource> {
    return this.http
      .get<ItemResponse<Resource>>(`/api/v1/users/${username}/circle`)
      .pipe(map((response) => response.resource))
  }

  statistic(resource: Resource): Observable<ResourceStatisic> {
    return this.http
      .get<ItemResponse<ResourceStatisic>>(`/api/v1/resources/${resource.id}/statistic`)
      .pipe(map((response) => response.resource))
  }

  completion(): Observable<ResourceCompletion> {
    return this.http
      .get<ItemResponse<ResourceCompletion>>('/api/v1/resources/completion')
      .pipe(map((response) => response.resource))
  }

  search(filters?: ResourceFilters): Observable<ListResponse<Resource>> {
    filters = filters || {}
    let params = new HttpParams()

    if (filters.search) {
      params = params.append('search', filters.search)
    }

    filters.types?.forEach((e) => {
      params = params.append('types', e)
    })

    filters.status?.forEach((e) => {
      params = params.append('status', e)
    })

    filters.members?.forEach((e) => {
      params = params.append('members', e)
    })

    filters.owners?.forEach((e) => {
      params = params.append('owners', e)
    })

    filters.watchers?.forEach((e) => {
      params = params.append('watchers', e)
    })

    if (filters.order) {
      params = params.append('order', filters.order)
    }

    if (filters.direction) {
      params = params.append('direction', filters.direction)
    }

    if (filters.period) {
      params = params.append('period', filters.period.toString())
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString())
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString())
    }

    if (filters.views) {
      params = params.append('views', 'true')
    }

    if (filters.parent) {
      params = params.append('parent', filters.parent)
    }

    return this.http.get<ListResponse<Resource>>(`/api/v1/resources`, { params })
  }

  find(id: string, markAsViewed?: boolean): Observable<Resource> {
    let params = new HttpParams()
    if (markAsViewed) {
      params = params.append('markAsViewed', 'true')
    }

    return this.http
      .get<ItemResponse<Resource>>(`/api/v1/resources/${id}`, {
        params,
      })
      .pipe(map((response) => response.resource))
  }

  update(id: string, input: UpdateResource): Observable<Resource> {
    return this.http
      .patch<ItemResponse<Resource>>(`/api/v1/resources/${id}`, input)
      .pipe(map((response) => response.resource))
  }

  create(input: CreateResource): Observable<Resource> {
    return this.http
      .post<ItemResponse<Resource>>('/api/v1/resources', input)
      .pipe(map((response) => response.resource))
  }
}
