/* eslint-disable @typescript-eslint/no-explicit-any */

import { ActivityVariables, ExerciseVariables, PLSourceFile } from '@platon/feature/compiler'
import { Activity } from '@platon/feature/course/common'
import { Correction } from './correction.model'

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

  variables: TVariables
  grade: number
  attempts: number

  startedAt?: Date | null
  succeededAt?: Date | null
  lastGradedAt?: Date | null

  source: PLSourceFile<TVariables>
  isBuilt: boolean
}

export type ExerciseSession = Session<ExerciseVariables>
export type ActivitySession = Session<ActivityVariables>
