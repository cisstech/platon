export interface CoursePermissions {
  readonly update: boolean
  /** The person may archive the course for themselves: they belong to it directly, not through a group. */
  readonly archive: boolean
}

export interface ActivityPermissions {
  readonly update: boolean
  readonly answer: boolean
  readonly viewStats: boolean
  readonly viewResource: boolean
}
