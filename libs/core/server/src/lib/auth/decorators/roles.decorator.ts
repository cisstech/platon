import { SetMetadata } from '@nestjs/common'
import { UserRoles } from '@platon/core/common'

export const ROLES_KEY = Symbol('roles')
export const Roles = (...roles: (UserRoles | keyof typeof UserRoles)[]) => SetMetadata(ROLES_KEY, roles)

export const ROLES_IF_BODY_HAS_KEY = Symbol('roles_if_body_has_key')
export const RolesIfBodyHasKey = <TBody extends object>(
  keys: (keyof TBody)[],
  ...roles: (UserRoles | keyof typeof UserRoles)[]
) => SetMetadata(ROLES_IF_BODY_HAS_KEY, [keys, roles])
