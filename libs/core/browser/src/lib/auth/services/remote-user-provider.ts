import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ItemResponse, ListResponse, User, UserFilters } from '@platon/core/common';
import { from, Observable } from 'rxjs';

import { map, mergeMap, toArray } from 'rxjs/operators';
import { UserProvider } from '../models/user-provider';


@Injectable()
export class RemoteUserProvider extends UserProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }


  search(filters: UserFilters): Observable<ListResponse<User>> {
    filters = filters || {};
    let params = new HttpParams();
    if (filters.search) {
      params = params.append('search', filters.search);
    }

    filters.roles?.forEach(role => {
      params = params.append('roles', role);
    });

    if (filters.order) {
      params = params.append('order', filters.order.toString());
    }

    if (filters.direction) {
      params = params.append('direction', filters.direction.toString());
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString());
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString());
    }

    return this.http.get<ListResponse<User>>(`/api/v1/users/`, { params });
  }

  findByUserName(username: string): Observable<User | undefined> {
    return this.http.get<ItemResponse<User>>(`/api/v1/users/${username}`).pipe(
      map(response => response.resource)
    );
  }

  findAllByUserNames(userNames: string[]): Observable<User[]> {
    const merge = from(userNames).pipe(
      mergeMap(username => this.findByUserName(username)),
      toArray()
    );
    return merge as Observable<User[]>;
  }
}
