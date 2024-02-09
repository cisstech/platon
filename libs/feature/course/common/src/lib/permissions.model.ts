export interface CoursePermissions {
  readonly update: boolean
}

export interface ActivityPermissions {
  readonly update: boolean
  readonly answer: boolean
  readonly viewStats: boolean
  readonly viewResource: boolean
}
