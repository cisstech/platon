import { User } from '@platon/core/common';
import { Observable } from 'rxjs';

/**
 * Provides an api to query user objects.
 */
export abstract class UserProvider {
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
}
