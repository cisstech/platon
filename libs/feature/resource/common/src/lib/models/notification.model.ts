import { ResourceEvent } from './event.model'

export const RESOURCE_EVENT_NOTIFICATION = 'RESOURCE-EVENT' as const
export interface ResourceEventNotification {
  type: typeof RESOURCE_EVENT_NOTIFICATION
  eventInfo: ResourceEvent
}
