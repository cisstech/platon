import { ResourceEntity } from '../resource.entity'
import { Repo } from './repo'

export const ON_CHANGE_FILE_EVENT = 'file.change'

export interface OnChangeFileEventPayload {
  repo: Repo
  path: string
  operation: 'create' | 'update' | 'delete'
  resource: ResourceEntity
}
