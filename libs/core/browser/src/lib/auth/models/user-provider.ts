import { ListResponse, User, UserFilters } from '@platon/core/common';
import { Observable } from 'rxjs';

/**
 * Provides an api to query user objects.
 */
export abstract class UserProvider {
  /**
   * Finds the users based on the given `filters`.
   * @param filters Filters to use.
   * @returns An observable that will emit the users that match the filters once the server will response.
   */
  abstract search(filters: UserFilters): Observable<ListResponse<User>>;

  /**
   * Finds the user identified by `username`.
   * @param username The username of the user to find.
   * @returns An observable that will emit the user found or `undefined` once the server will response.
   */
  abstract findByUserName(username: string): Observable<User | undefined>;

  /**
   * Finds All the users listed in the `userNames` array.
   * @param usernames An array of user names to find.
   * @returns An observable that will emit the user found or `undefined` once the server will response.
   */
  abstract findAllByUserNames(usernames: string[]): Observable<User[]>;
}
