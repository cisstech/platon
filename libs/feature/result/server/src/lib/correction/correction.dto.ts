import { BaseDTO } from '@platon/core/server'
import {
  Correction,
  ActivityCorrection,
  ActivityCorrectionSummary,
  ExerciseCorrection,
  UpsertCorrection,
  Label,
} from '@platon/feature/result/common'
import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { CorrectionLabelEntity } from '../label/correction-label/correction-label.entity'

export class CorrectionDTO extends BaseDTO implements Correction {
  @IsUUID()
  authorId!: string

  @IsNumber()
  grade!: number
}

export class ActivityCorrectionDTO implements ActivityCorrection {
  @IsUUID()
  activityId!: string

  @IsString()
  activityName!: string

  @IsUUID()
  courseId!: string

  @IsString()
  courseName!: string

  @IsArray()
  @Type(() => ExerciseCorrectionDTO)
  exercises!: ExerciseCorrectionDTO[]
}

export class ExerciseCorrectionDTO implements ExerciseCorrection {
  @IsUUID()
  userId!: string

  @IsUUID()
  exerciseId!: string

  @IsString()
  exerciseName!: string

  @IsUUID()
  activitySessionId!: string

  @IsUUID()
  exerciseSessionId!: string

  @IsOptional()
  @IsUUID()
  correctedBy?: string

  @IsOptional()
  @IsDate()
  correctedAt?: Date

  @IsOptional()
  @IsNumber()
  correctedGrade?: number

  @IsOptional()
  @IsNumber()
  grade?: number

  @IsArray()
  labels!: Label[]

  @IsOptional()
  @IsBoolean()
  hasUploads!: boolean
}

export class ActivityCorrectionSummaryDTO implements ActivityCorrectionSummary {
  @IsUUID()
  activityId!: string

  @IsString()
  activityName!: string

  @IsUUID()
  courseId!: string

  @IsString()
  courseName!: string

  @IsNumber()
  totalExercises!: number

  @IsNumber()
  correctedExercises!: number

  @IsNumber()
  pendingCopies!: number
}

export class UpsertCorrectionDTO implements UpsertCorrection {
  @IsNumber()
  grade!: number

  @IsArray()
  labels!: CorrectionLabelEntity[]
}
