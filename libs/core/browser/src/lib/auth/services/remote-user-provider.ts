import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ItemResponse, UserDTO } from '@platon/core/common';
import { from, Observable } from 'rxjs';

import { map, mergeMap, toArray } from 'rxjs/operators';
import { UserProvider } from '../models/user-provider';


@Injectable()
export class RemoteUserProvider extends UserProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  findByUserName(username: string): Observable<UserDTO | undefined> {
    return this.http.get<ItemResponse<UserDTO>>(`/api/v1/users/${username}`).pipe(
      map(response => response.resource)
    );
  }

  findAllByUserNames(userNames: string[]): Observable<UserDTO[]> {
    const merge = from(userNames).pipe(
      mergeMap(username => this.findByUserName(username)),
      toArray()
    );
    return merge as Observable<UserDTO[]>;
  }
}
