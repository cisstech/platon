export const RESOURCE_EVENT_NOTIFICATION = 'RESOURCE-EVENT' as const;
export interface ResourceEventNotification {
  type: typeof RESOURCE_EVENT_NOTIFICATION,
  eventInfo: {
    type: string,
    actorId: string,
    resourceId: string,
    createdAt: Date,
    data: Record<string, unknown>
  }
}
