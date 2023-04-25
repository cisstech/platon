import { Injectable } from '@angular/core';
import { CreateUserGroup, ListResponse, UpdateUserGroup, User, UserFilters, UserGroup, UserGroupFilters } from '@platon/core/common';
import { combineLatest, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserProvider } from '../models/user-provider';

/**
 * Facade class that will provide access to the user api of the platform.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private users = new Map<string, User>();

  constructor(
    private readonly provider: UserProvider
  ) { }


  search(filters: UserFilters): Observable<ListResponse<User>> {
    return this.provider.search(filters);
  }

  /**
   * Finds the user identified by `username`.
   *
   * Note:
   * This method will make an http request only if the user is not cached in the memory.
   *
   * @param username The name of the user to find.
   * @returns An observable that will emit the user found or `undefined` once the server will response.
   */
  findByUserName(username: string): Observable<User | undefined> {
    const cache = this.users.get(username);
    if (cache != null) {
      return of(cache);
    }

    return this.provider.findByUserName(username).pipe(
      tap(user => {
        if (user != null) {
          this.users.set(username, user);
        }
      })
    );
  }

  /**
   * Finds all the users listed in the `uids` array.
   *
   * Note:
   * This method will make an http request only if the users that are not cached in the memory.
   *
   * @param usernames An array of user identifiers to find.
   * @returns An observable that will emit the user found or `undefined` once the server will response.
   */
  findAllByUserNames(usernames: string[]): Observable<User[]> {
    const notCached: string[] = [];
    const cacheElements = usernames.map(username => {
      const user = this.users.get(username);
      if (user == null) {
        notCached.push(username);
      }
      return user;
    }).filter(e => e != null) as User[];

    return combineLatest([
      of(cacheElements),
      this.provider.findAllByUserNames(notCached),
    ]).pipe(
      map(([fromCache, fromServer]) => {
        fromServer.forEach(e => {
          this.users.set(e.username, e);
        });
        return fromCache.concat(fromServer);
      })
    );
  }

  searchUserGroups(filters: UserGroupFilters): Observable<ListResponse<UserGroup>> {
    return this.provider.searchUserGroups(filters);
  }

  createUserGroup(input: CreateUserGroup): Observable<UserGroup> {
    return this.provider.createUserGroup(input);
  }

  updateUserGroup(groupId: string, input: UpdateUserGroup): Observable<UserGroup> {
    return this.provider.updateUserGroup(groupId, input);
  }

  deleteUserGroup(groupId: string): Observable<void> {
    return this.provider.deleteUserGroup(groupId);
  }
}
