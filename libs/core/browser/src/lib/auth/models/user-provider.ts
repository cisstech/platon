import { ListResponse, UpdateUser, User, UserFilters } from '@platon/core/common'
import { Observable } from 'rxjs'

/**
 * Provides an api to query user objects.
 */
export abstract class UserProvider {
  /**
   * Updates a user by its id or username with the given `input`.
   * @param user The `identifier|username|instance` representing the user to update.
   * @param input The new values to update.
   */
  abstract update(user: string | User, input: UpdateUser): Observable<User>
  /**
   * Finds the users based on the given `filters`.
   * @param filters Filters to use.
   * @returns An observable that will emit the users that match the filters once the server will response.
   */
  abstract search(filters: UserFilters): Observable<ListResponse<User>>

  /**
   * Finds the user identified by `idOrUsername`.
   * @param idOrUsername The id or username of the user to find.
   * @returns An observable that will emit the user found or `undefined` once the server will response.
   */
  abstract findByIdOrName(idOrUsername: string): Observable<User | undefined>

  /**
   * Finds All the users listed in the `userNames` array.
   * @param usernames An array of user names to find.
   * @returns An observable that will emit the user found or `undefined` once the server will response.
   */
  abstract findAllByUserNames(usernames: string[]): Observable<User[]>
}
