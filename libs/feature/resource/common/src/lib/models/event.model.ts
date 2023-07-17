import { ResourceEventTypes } from '../enums/resource-event-types'
import { ResourceTypes } from '../enums/resource-types'

export type ResourceEventData<TData = unknown> = TData & {
  resourceName: string
  resourceType: ResourceTypes
}

export interface ResourceEvent<TData = unknown> {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt?: Date
  readonly type: ResourceEventTypes
  readonly actorId: string
  readonly resourceId: string
  readonly data: ResourceEventData<TData>
}

export interface ResourceEventFilters {
  readonly offset?: number
  readonly limit?: number
}

/**
 * Data of the {@link ResourceMemberCreateEvent} event.
 */
export interface ResourceMemberCreateEventData {
  /**
   * Id of the added member
   */
  userId: string

  /**
   * Name of the resource to which the member is added
   */
  resourceName: string

  /**
   * Type of the resource to which the member is added
   */
  resourceType: ResourceTypes
}

/**
 * Event triggered when a member is added to a resource.
 * @note `event.actorId` is the id of the user who added the member.
 * @note `event.data.userId` is the added member id.
 */
export interface ResourceMemberCreateEvent extends ResourceEvent<ResourceMemberCreateEventData> {
  readonly type: ResourceEventTypes.MEMBER_CREATE
}

/**
 * Data of the {@link ResourceMemberRemoveEvent} event.
 */
export interface ResourceMemberRemoveEventData {
  /**
   * Name of the resource from which the member is removed
   */
  resourceName: string

  /**
   * Type of the resource from which the member is removed
   */
  resourceType: ResourceTypes
}

/**
 * Event triggered when a member is removed from a resource.
 * @note `event.actorId` is the id of the removed member.
 */
export interface ResourceMemberRemoveEvent extends ResourceEvent<ResourceMemberRemoveEventData> {
  readonly type: ResourceEventTypes.MEMBER_REMOVE
}

/**
 * Data of the {@link ResourceCreateEvent} event.
 */
export interface ResourceCreateEventData {
  /**
   * Id of the created resource
   */
  resourceId: string

  /**
   * Type of the created resource
   */
  resourceType: ResourceTypes

  /**
   * Name of the created resource
   */
  resourceName: string
}

/**
 * Event triggered when a resource is created.
 *
 * @note `event.resourceId` property represents the id of the resource parent.
 *  The created resource id is available in the `event.data.resourceId` property.
 */
export interface ResourceCreateEvent extends ResourceEvent<ResourceCreateEventData> {
  readonly type: ResourceEventTypes.RESOURCE_CREATE
}

/**
 * Data of the {@link ResourceStatusChangeEvent} event.
 */
export interface ResourceStatusChangeEventData {
  /**
   * Type of the changed resource
   */
  resourceType: ResourceTypes

  /**
   * Name of the changed resource
   */
  resourceName: string

  /**
   * New status of the changed resource
   */
  newStatus: string
}

/**
 * Event triggered when the status of a resource changes.
 */
export interface ResourceStatusChangeEvent extends ResourceEvent<ResourceStatusChangeEventData> {
  readonly type: ResourceEventTypes.RESOURCE_STATUS_CHANGE
}
