import { ActivitySettings, PleConfigJSON } from '@platon/feature/compiler'
import { FileVersion } from './file.model'

export interface ActivityResourceMeta {
  settings: ActivitySettings
  versions: FileVersion[]
}

export interface ExerciseResourceMeta {
  configurable: boolean
  config?: PleConfigJSON
  versions: FileVersion[]
}

export type ResourceMeta = ActivityResourceMeta | ExerciseResourceMeta
