import { ResourceEntity } from '../resource.entity'
import { Repo } from './repo'

export const ON_CHANGE_FILE_EVENT = 'file.change'
export const ON_RELEASE_REPO_EVENT = 'repo.release'

export interface OnChangeFileEventPayload {
  repo: Repo
  path: string
  operation: 'create' | 'update' | 'delete'
  resource: ResourceEntity

  /**
   * Old content of the file in case of an update.
   */
  oldContent?: string

  /**
   * New content of the file in case of an update.
   */
  newContent?: string
}

export interface OnReleaseRepoEventPayload {
  repo: Repo
  resource: ResourceEntity
}
