import { MemberPermissions } from './permissions.model'

export interface ResourceInvitation {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt?: Date
  readonly inviterId: string
  readonly inviteeId: string
  readonly resourceId: string
  readonly permissions: MemberPermissions
}

export interface CreateResourceInvitation {
  readonly inviteeId: string
  readonly permissions: MemberPermissions
}
