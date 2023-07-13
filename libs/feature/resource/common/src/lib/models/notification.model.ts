import { ResourceTypes } from '../enums/resource-types'
import { ResourceEvent } from './event.model'

export const RESOURCE_EVENT_NOTIFICATION = 'RESOURCE-EVENT' as const
export interface ResourceEventNotification {
  type: typeof RESOURCE_EVENT_NOTIFICATION
  eventInfo: ResourceEvent
}

export const RESOURCE_INVITATION_NOTIFICATION = 'RESOURCE-INVITATION' as const
export interface ResourceInvitationNotification {
  type: typeof RESOURCE_INVITATION_NOTIFICATION
  inviterId: string
  inviteeId: string
  inviterName: string
  inviteeName: string

  invitationId: string
  resourceId: string
  resourceName: string
  resourceType: ResourceTypes
}
