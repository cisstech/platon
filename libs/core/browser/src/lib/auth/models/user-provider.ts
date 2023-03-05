import { CreateUserGroup, ItemResponse, ListResponse, UpdateUserGroup, User, UserFilters, UserGroup, UserGroupFilters } from '@platon/core/common';
import { Observable } from 'rxjs';

/**
 * Provides an api to query user objects.
 */
export abstract class UserProvider {
  /**
   * Finds the users based on the given `filters`.
   * @param uid Filters to use.
   * @returns An observable that will emit the users that match the filters once the server will response.
   */
  abstract search(filters: UserFilters): Observable<ListResponse<User>>;

  /**
   * Finds the user identified by `username`.
   * @param uid The username of the user to find.
   * @returns An observable that will emit the user found or `undefined` once the server will response.
   */
  abstract findByUserName(username: string): Observable<User | undefined>;

  /**
   * Finds All the users listed in the `userNames` array.
   * @param uid An array of user names to find.
   * @returns An observable that will emit the user found or `undefined` once the server will response.
   */
  abstract findAllByUserNames(userNames: string[]): Observable<User[]>;


  /**
   * Finds the user groups based on the given `filters`.
   * @param uid Filters to use.
   * @returns An observable that will emit the user groups that match the filters once the server will response.
   */
  abstract searchUserGroups(filters: UserGroupFilters): Observable<ListResponse<UserGroup>>;
  abstract createUserGroup(input: CreateUserGroup): Observable<UserGroup>;
  abstract updateUserGroup(groupId: string, input: UpdateUserGroup): Observable<UserGroup>;
  abstract deleteUserGroup(groupId: string): Observable<void>;

}
