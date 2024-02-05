import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import {
  CreateUserGroup,
  ItemResponse,
  ListResponse,
  UpdateUser,
  UpdateUserGroup,
  User,
  UserFilters,
  UserGroup,
  UserGroupFilters,
} from '@platon/core/common'
import { Observable, from, of } from 'rxjs'

import { catchError, map, mergeMap, toArray } from 'rxjs/operators'
import { buildHttpParams } from '../../http/utils'
import { UserProvider } from '../models/user-provider'

const getId = (user: User | string): string => {
  return typeof user === 'string' ? user : user.id
}

@Injectable()
export class RemoteUserProvider extends UserProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  update(user: string | User, input: UpdateUser): Observable<User> {
    return this.http
      .patch<ItemResponse<User>>(`/api/v1/users/${getId(user)}`, input)
      .pipe(map((response) => response.resource))
  }

  search(filters: UserFilters): Observable<ListResponse<User>> {
    const params = buildHttpParams(filters)
    return this.http.get<ListResponse<User>>(`/api/v1/users/`, { params })
  }

  findByIdOrName(idOrUsername: string): Observable<User | undefined> {
    return this.http.get<ItemResponse<User>>(`/api/v1/users/${idOrUsername}`).pipe(
      map((response) => response.resource),
      catchError(() => of(undefined))
    )
  }

  findAllByUserNames(userNames: string[]): Observable<User[]> {
    const merge = from(userNames).pipe(
      mergeMap((username) => this.findByIdOrName(username)),
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
