import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import {
  CreateUserGroup,
  ItemResponse,
  ListResponse,
  UpdateUserGroup,
  User,
  UserFilters,
  UserGroup,
  UserGroupFilters,
} from '@platon/core/common'
import { from, Observable, of } from 'rxjs'

import { catchError, map, mergeMap, toArray } from 'rxjs/operators'
import { UserProvider } from '../models/user-provider'

@Injectable()
export class RemoteUserProvider extends UserProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  search(filters: UserFilters): Observable<ListResponse<User>> {
    filters = filters || {}
    let params = new HttpParams()
    if (filters.search) {
      params = params.append('search', filters.search)
    }

    filters.roles?.forEach((role) => {
      params = params.append('roles', role)
    })

    filters.groups?.forEach((group) => {
      params = params.append('groups', group)
    })

    filters.lmses?.forEach((group) => {
      params = params.append('lmses', group)
    })

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

    return this.http.get<ListResponse<User>>(`/api/v1/users/`, { params })
  }

  findByUserName(username: string): Observable<User | undefined> {
    return this.http.get<ItemResponse<User>>(`/api/v1/users/${username}`).pipe(
      map((response) => response.resource),
      catchError(() => of(undefined))
    )
  }

  findAllByUserNames(userNames: string[]): Observable<User[]> {
    const merge = from(userNames).pipe(
      mergeMap((username) => this.findByUserName(username)),
      toArray()
    )
    return merge as Observable<User[]>
  }

  searchUserGroups(filters: UserGroupFilters): Observable<ListResponse<UserGroup>> {
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

  createUserGroup(input: CreateUserGroup): Observable<UserGroup> {
    return this.http
      .post<ItemResponse<UserGroup>>(`/api/v1/user-groups`, input)
      .pipe(map((response) => response.resource))
  }

  updateUserGroup(groupId: string, input: UpdateUserGroup): Observable<UserGroup> {
    return this.http
      .patch<ItemResponse<UserGroup>>(`/api/v1/user-groups/${groupId}`, input)
      .pipe(map((response) => response.resource))
  }

  deleteUserGroup(groupId: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/user-groups/${groupId}`, {})
  }
}
