import {
  CourseActivitiesFilter,
  ActivityOpenStates,
  PlayableActivity,
  TaughtActivity,
} from '@platon/feature/course/common'
import { RecentCopy, RecentCopyStatus } from '@platon/feature/result/common'
import { IsBoolean, IsDate, IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'

/** The activities of the homes, or of one course with `course`. */
export class HomeActivitiesFilterDTO implements CourseActivitiesFilter {
  @IsOptional()
  @IsUUID()
  readonly course?: string
}

export class PlayableActivityDTO implements PlayableActivity {
  @IsUUID()
  readonly id!: string

  @IsUUID()
  readonly courseId!: string

  @IsString()
  readonly courseName!: string

  @IsUUID()
  readonly sectionId!: string

  @IsNumber()
  readonly order!: number

  @IsString()
  readonly title!: string

  @IsOptional()
  @IsDate()
  readonly openAt?: Date | null

  @IsOptional()
  @IsDate()
  readonly closeAt?: Date | null

  @IsString()
  readonly state!: ActivityOpenStates

  @IsBoolean()
  readonly isChallenge!: boolean

  @IsBoolean()
  readonly graded!: boolean

  @IsOptional()
  @IsNumber()
  readonly duration?: number

  @IsOptional()
  @IsNumber()
  readonly attempts?: number

  @IsNumber()
  readonly exerciseCount!: number

  @IsNumber()
  readonly exercisesDone!: number

  @IsBoolean()
  readonly started!: boolean

  @IsBoolean()
  readonly terminated!: boolean

  @IsOptional()
  @IsBoolean()
  readonly correcting?: boolean

  @IsOptional()
  @IsNumber()
  readonly grade?: number
}

export class TaughtActivityDTO implements TaughtActivity {
  @IsUUID()
  readonly id!: string

  @IsUUID()
  readonly courseId!: string

  @IsString()
  readonly courseName!: string

  @IsUUID()
  readonly sectionId!: string

  @IsNumber()
  readonly order!: number

  @IsString()
  readonly title!: string

  @IsOptional()
  @IsUUID()
  readonly resourceId?: string

  @IsOptional()
  @IsDate()
  readonly openAt?: Date | null

  @IsOptional()
  @IsDate()
  readonly closeAt?: Date | null

  @IsString()
  readonly state!: ActivityOpenStates

  @IsBoolean()
  readonly restricted!: boolean

  @IsBoolean()
  readonly isChallenge!: boolean

  @IsBoolean()
  readonly graded!: boolean

  @IsOptional()
  @IsNumber()
  readonly duration?: number

  @IsOptional()
  @IsNumber()
  readonly attempts?: number

  @IsNumber()
  readonly exerciseCount!: number

  @IsNumber()
  readonly studentCount!: number

  @IsNumber()
  readonly startedCount!: number

  @IsOptional()
  @IsNumber()
  readonly averageGrade?: number

  @IsOptional()
  @IsNumber()
  readonly pendingCopies?: number

  @IsOptional()
  @IsString({ each: true })
  readonly correctors?: string[]
}

export class RecentCopyDTO implements RecentCopy {
  @IsUUID()
  readonly sessionId!: string

  @IsUUID()
  readonly activityId!: string

  @IsString()
  readonly activityTitle!: string

  @IsUUID()
  readonly courseId!: string

  @IsString()
  readonly courseName!: string

  @IsDate()
  readonly terminatedAt!: Date

  @IsIn(['graded', 'correcting', 'hidden'])
  readonly status!: RecentCopyStatus

  @IsOptional()
  @IsNumber()
  readonly grade?: number
}
