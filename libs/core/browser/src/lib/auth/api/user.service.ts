import { Injectable } from '@angular/core';
import { CreateUserGroup, ListResponse, UpdateUserGroup, UpdateUserPrefs, User, UserFilters, UserGroup, UserGroupFilters, UserPrefs } from '@platon/core/common';
import { combineLatest, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserGroupProvider } from '../models/user-group-provider';
import { UserPrefsProvider } from '../models/user-prefs-provider';
import { UserProvider } from '../models/user-provider';

/**
 * Facade class that will provide access to the user api of the platform.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private users = new Map<string, User>();

  constructor(
    private readonly userProvider: UserProvider,
    private readonly userGroupProvider: UserGroupProvider,
    private readonly userPrefsProvider: UserPrefsProvider,
  ) { }


  search(filters: UserFilters): Observable<ListResponse<User>> {
    return this.userProvider.search(filters);
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

    return this.userProvider.findByUserName(username).pipe(
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
      this.userProvider.findAllByUserNames(notCached),
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
    return this.userGroupProvider.search(filters);
  }

  createUserGroup(input: CreateUserGroup): Observable<UserGroup> {
    return this.userGroupProvider.create(input);
  }

  updateUserGroup(groupId: string, input: UpdateUserGroup): Observable<UserGroup> {
    return this.userGroupProvider.update(groupId, input);
  }

  deleteUserGroup(groupId: string): Observable<void> {
    return this.userGroupProvider.delete(groupId);
  }

  findUserPrefs(username: string): Observable<UserPrefs> {
    return this.userPrefsProvider.find(username);
  }

  updateUserPrefs(username: string, input: UpdateUserPrefs): Observable<UserPrefs> {
    return this.userPrefsProvider.update(username, input);

  }
}
