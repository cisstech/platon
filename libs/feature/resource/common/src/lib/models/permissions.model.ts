export interface MemberPermissions {
  readonly read: boolean
  readonly write: boolean
}

export interface ResourcePermissions extends MemberPermissions {
  readonly watcher: boolean
}
