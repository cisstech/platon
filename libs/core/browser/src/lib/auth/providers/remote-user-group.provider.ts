import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import {
  CreateUserGroup,
  ItemResponse,
  ListResponse,
  UpdateUserGroup,
  UserGroup,
  UserGroupFilters,
} from '@platon/core/common'
import { Observable } from 'rxjs'

import { map } from 'rxjs/operators'
import { UserGroupProvider } from '../models/user-group-provider'

@Injectable()
export class RemoteUserGroupProvider extends UserGroupProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  search(filters: UserGroupFilters): Observable<ListResponse<UserGroup>> {
    filters = filters || {}
    let params = new HttpParams()

    if (filters.search) {
      params = params.append('search', filters.search)
    }

    if (filters.order) {
      params = params.append('order', filters.order.toString())
    }

    if (filters.direction) {
      params = params.append('direction', filters.direction.toString())
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString())
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString())
    }

    return this.http.get<ListResponse<UserGroup>>(`/api/v1/user-groups/`, { params })
  }

  create(input: CreateUserGroup): Observable<UserGroup> {
    return this.http
      .post<ItemResponse<UserGroup>>(`/api/v1/user-groups`, input)
      .pipe(map((response) => response.resource))
  }

  update(groupId: string, input: UpdateUserGroup): Observable<UserGroup> {
    return this.http
      .patch<ItemResponse<UserGroup>>(`/api/v1/user-groups/${groupId}`, input)
      .pipe(map((response) => response.resource))
  }

  delete(groupId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/user-groups/${groupId}`, {})
  }
}
