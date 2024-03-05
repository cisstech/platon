import { ResourceEntity } from './resource.entity'

export const ON_CREATE_RESOURCE_EVENT = 'resource.create'

export interface OnCreateResourceEventPayload {
  resource: ResourceEntity
}
