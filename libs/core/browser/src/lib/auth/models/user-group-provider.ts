import {
  CreateUserGroup,
  ListResponse,
  UpdateUserGroup,
  UserGroup,
  UserGroupFilters,
} from '@platon/core/common'
import { Observable } from 'rxjs'

export abstract class UserGroupProvider {
  /**
   * Finds the user groups based on the given `filters`.
   * @param filters Filters to use.
   * @returns An observable that will emit the user groups that match the filters once the server will response.
   */
  abstract search(filters: UserGroupFilters): Observable<ListResponse<UserGroup>>
  abstract create(input: CreateUserGroup): Observable<UserGroup>
  abstract update(groupId: string, input: UpdateUserGroup): Observable<UserGroup>
  abstract delete(groupId: string): Observable<void>
}
