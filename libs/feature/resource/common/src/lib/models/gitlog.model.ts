import { ReadCommitResult } from 'isomorphic-git'

export interface GitLogResult extends ReadCommitResult {
  tag?: string
}
