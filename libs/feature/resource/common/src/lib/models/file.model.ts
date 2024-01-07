import { Variables } from '@platon/feature/compiler'

export const LATEST = 'latest'

export enum FileMoveActions {
  move = 'move',
  copy = 'copy',
}

export enum FileTypes {
  file = 'file',
  folder = 'folder',
}

export interface ResourceFile {
  oid: string
  path: string
  type: FileTypes
  version: string
  resourceId: string
  resourceCode?: string

  url: string
  bundleUrl: string
  downloadUrl: string
  describeUrl: string

  readOnly?: boolean
  children?: ResourceFile[]
}

export interface FileRetrieve extends FileSearch {
  stat?: boolean
  version?: string
  bundle?: boolean
  versions?: boolean
  describe?: boolean
  download?: boolean
}

export interface FileCreate {
  path: string
  content?: string
}

export interface FileUpdate {
  content: string
}

export interface FileMove {
  copy?: boolean
  unzip?: boolean
  rename?: boolean
  destination?: string
}

export interface FileRelease {
  name: string
  message: string
}

export interface FileSearch {
  search: string
  use_regex?: boolean
  match_word?: boolean
  match_case?: boolean
}

export interface FileSearchMatch {
  line: number
  path: string
  preview: string
}

export interface FileSearchResults {
  results: {
    [k: string]: FileSearchMatch[]
  }
}

export interface FileVersion {
  tag: string
  tagger: {
    name: string
    email: string
  }
  message: string
  createdAt: string
}

export interface FileVersions {
  all: FileVersion[]
  latest?: FileVersion
}

export interface ExerciseTransformInput {
  changes: Variables
  includes?: string[]
}
