/* eslint-disable @typescript-eslint/no-explicit-any */

import { ActivityVariables, ExerciseVariables, PLSourceFile } from '@platon/feature/compiler'
import { Activity } from '@platon/feature/course/common'
import { Correction } from './correction.model'

export interface Session<TVariables = any> {
  id: string
  createdAt: Date
  updatedAt: Date
  parentId?: string

  parent?: Session<ActivityVariables>
  envid?: string
  userId?: string
  activity?: Activity
  activityId?: string
  correction?: Correction
  correctionId?: string

  variables: TVariables
  grade: number
  attempts: number

  startedAt?: Date
  lastGradedAt?: Date

  source: PLSourceFile<TVariables>
  isBuilt: boolean
}

export type ExerciseSession = Session<ExerciseVariables>
export type ActivitySession = Session<ActivityVariables>
