import { User, UserRoles } from '@platon/core/common'

// On recreer les interfaces d'editorJs nous-même car on ne pas utiliser les siennes dans NestJs car ça vient d'Angular.
export interface BlockToolData<Data extends object = any> {
  [key: string]: Data
}

export interface BlockTuneData {
  [key: string]: any
}

export type BlockId = string

export interface OutputBlockData<Type extends string = string, Data extends object = any> {
  /**
   * Unique Id of the block
   */
  id?: BlockId
  /**
   * Tool type
   */
  type: Type
  /**
   * Saved Block data
   */
  data: BlockToolData<Data>

  /**
   * Block Tunes data
   */
  tunes?: { [name: string]: BlockTuneData }
}

export interface EditorOutputData {
  /**
   * Editor's version
   */
  version?: string

  /**
   * Timestamp of saving in milliseconds
   */
  time?: number

  /**
   * Saved Blocks
   */
  blocks: OutputBlockData[]
}

export interface Announcement {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly createdAt: Date
  readonly updatedAt?: Date
  readonly publisher?: User
  readonly active: boolean

  readonly displayUntil?: Date
  readonly displayDurationInDays?: number
  readonly targetedRoles?: UserRoles[]
  readonly version?: string
  readonly icon?: string
  readonly data?: EditorOutputData
  readonly actions?: AnnouncementAction[]
  /** When the person who asks read it (opened it, or closed its banner); in the visible list only. */
  readonly readAt?: Date
}

export interface CreateAnnouncementInput {
  title: string
  description: string
  active: boolean
  displayUntil?: Date
  displayDurationInDays?: number
  targetedRoles?: UserRoles[]
  version?: string
  icon?: string
  data?: EditorOutputData
  actions?: AnnouncementAction[]
}

export type UpdateAnnouncementInput = CreateAnnouncementInput

export interface AnnouncementAction {
  label: string
  url?: string // URL vers laquelle rediriger
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link' // Type de bouton
}

export interface AnnouncementFilters {
  search?: string
  active?: boolean
  roles?: UserRoles[]
  limit?: number
  offset?: number
}
