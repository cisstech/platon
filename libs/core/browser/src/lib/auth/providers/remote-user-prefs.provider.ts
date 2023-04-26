import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ItemResponse, UpdateUserPrefs, UserPrefs } from '@platon/core/common';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import { UserPrefsProvider } from '../models/user-prefs-provider';


@Injectable()
export class RemoteUserPrefsProvider extends UserPrefsProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  find(username: string): Observable<UserPrefs> {
    return this.http.get<ItemResponse<UserPrefs>>(`/api/v1/users/${username}/prefs`)
      .pipe(
        map(response => response.resource)
      );
  }
  update(username: string, input: UpdateUserPrefs): Observable<UserPrefs> {
    return this.http.patch<ItemResponse<UserPrefs>>(
      `/api/v1/users/${username}/prefs`, input
    ).pipe(
      map(response => response.resource)
    );
  }
}
