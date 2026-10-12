/* eslint-disable @typescript-eslint/no-explicit-any */

import { ActivityVariables, ExerciseVariables, PLSourceFile } from '@platon/feature/compiler'
import { Activity } from '@platon/feature/course/common'
import { Correction } from './correction.model'
import { StudentSubmission } from './submission.model'

export interface Session<TVariables = any> {
  id: string
  createdAt: Date
  updatedAt: Date

  parentId?: string | null
  parent?: Session<ActivityVariables> | null
  envid?: string | null
  userId?: string | null
  activity?: Activity | null
  activityId?: string | null
  correction?: Correction | null
  correctionId?: string | null
  submissions?: StudentSubmission[] | null

  variables: TVariables
  grade: number
  attempts: number

  startedAt?: Date | null
  succeededAt?: Date | null
  lastGradedAt?: Date | null
  /** When the copy was terminated, by its student or by the closing of its activity. */
  terminatedAt?: Date | null

  source: PLSourceFile<TVariables>
  isBuilt: boolean
}

export type ExerciseSession = Session<ExerciseVariables>
export type ActivitySession = Session<ActivityVariables>

/**
 * What a terminated copy shows of its grade: the grade itself, a correction still under way, or
 * nothing when its activity does not show the correction.
 */
export type RecentCopyStatus = 'graded' | 'correcting' | 'hidden'

/** A copy a person terminated, as their home lists it (`GET /results/recent`). */
export interface RecentCopy {
  readonly sessionId: string
  readonly activityId: string
  readonly activityTitle: string
  readonly courseId: string
  readonly courseName: string
  readonly terminatedAt: Date
  readonly status: RecentCopyStatus
  /** On 100, only when `status` is `graded`. */
  readonly grade?: number
}
