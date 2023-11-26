export interface MemberPermissions {
  readonly read: boolean
  readonly write: boolean
}

export interface ResourcePermissions extends MemberPermissions {
  readonly member: boolean
  readonly watcher: boolean
  readonly waiting: boolean
}
