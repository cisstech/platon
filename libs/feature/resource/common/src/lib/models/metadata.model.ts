import { ActivitySettings } from '@platon/feature/compiler'
import { FileVersion } from './file.model'

export interface ActivityResourceMeta {
  settings: ActivitySettings
  versions: FileVersion[]
}

export interface ExerciseResourceMeta {
  configurable: boolean
  versions: FileVersion[]
}
