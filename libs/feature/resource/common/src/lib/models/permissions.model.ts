/**
 * Represents the permissions for a member on a resource.
 */
export interface MemberPermissions {
  /**
   * Indicates if the user can read the resource.
   */
  readonly read: boolean

  /**
   * Indicates if the user can write the resource.
   */
  readonly write: boolean
}

/**
 * Represents specific user permissions on a resource.
 */
export interface ResourcePermissions extends MemberPermissions {
  /**
   * Indicates if the user is a member of the resource.
   */
  readonly member: boolean

  /**
   * Indicates if the user is a watcher of the resource.
   */
  readonly watcher: boolean

  /**
   * Indicates if the user is waiting for being accepted as a member of the resource.
   */
  readonly waiting: boolean
}

/**
 * Returns an empty ResourcePermissions object.
 * The returned object has the following properties:
 * - read: true
 * - write: false
 * - member: false
 * - watcher: false
 * - waiting: false
 *
 * @returns {ResourcePermissions} An empty ResourcePermissions object.
 */
export const emptyResourcePermissions = (): ResourcePermissions => ({
  read: true,
  write: false,
  member: false,
  watcher: false,
  waiting: false,
})

/**
 * Returns a ResourcePermissions object with all permissions set to false.
 * @returns {ResourcePermissions} The ResourcePermissions object with all permissions set to false.
 */
export const noResourcePermissions = (): ResourcePermissions => ({
  read: false,
  write: false,
  member: false,
  watcher: false,
  waiting: false,
})
