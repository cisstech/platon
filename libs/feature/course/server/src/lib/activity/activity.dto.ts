import { ApiProperty } from '@nestjs/swagger'
import { BaseDTO, toArray, toBoolean, toDate, toNumber } from '@platon/core/server'
import { ActivitySettings } from '@platon/feature/compiler'
import {
  Activity,
  ActivityFilters,
  ActivityOpenStates,
  CreateActivity,
  ReloadActivity,
  UpdateActivity,
} from '@platon/feature/course/common'
import { Exclude, Transform, Type } from 'class-transformer'
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, IsUUID, Matches } from 'class-validator'
import { ActivityPermissionsDTO } from '../permissions/permissions.dto'
import { RestrictionListDTO } from './activity-restriction.dto'

export class ActivityDTO extends BaseDTO implements Activity {
  @IsUUID()
  @ApiProperty()
  readonly courseId!: string

  @IsUUID()
  @ApiProperty()
  readonly sectionId!: string

  @IsOptional()
  @IsDate()
  readonly openAt?: Date

  @IsOptional()
  @IsDate()
  readonly closeAt?: Date

  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  readonly isChallenge!: boolean

  @IsString()
  readonly title!: string

  @IsString()
  readonly resourceId!: string

  @IsString()
  readonly state!: ActivityOpenStates

  @IsNumber()
  @ApiProperty()
  readonly timeSpent = 0

  @IsNumber()
  @ApiProperty()
  readonly progression = 0

  @IsNumber()
  @ApiProperty()
  readonly exerciseCount = 0

  @Type(() => ActivityPermissionsDTO)
  readonly permissions!: ActivityPermissionsDTO

  @IsBoolean()
  @ApiProperty()
  readonly isPeerComparison = false

  @Exclude()
  readonly source?: unknown

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  readonly ignoreRestrictions?: boolean

  @Type(() => RestrictionListDTO)
  @IsOptional()
  readonly restrictions?: RestrictionListDTO[] | null

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  readonly colorHue?: number

  @Type(() => Object)
  @ApiProperty()
  @IsOptional()
  readonly activitySettings?: ActivitySettings

  @IsString()
  readonly code!: string

  @IsBoolean()
  @ApiProperty()
  readonly graded = false
}

export class ActivityFiltersDTO implements ActivityFilters {
  @IsOptional()
  @IsUUID()
  @ApiProperty()
  readonly sectionId?: string | null

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @ApiProperty()
  @IsBoolean()
  challenge?: boolean | null
}

export class CreateCourseActivityDTO implements CreateActivity {
  @IsUUID()
  @ApiProperty()
  readonly sectionId!: string

  @IsUUID()
  @ApiProperty()
  readonly resourceId!: string

  @IsString()
  @ApiProperty()
  readonly resourceVersion!: string

  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly openAt?: Date

  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly closeAt?: Date

  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty()
  readonly members?: string[]

  @Transform(({ value }) => toArray(value))
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty()
  readonly correctors?: string[]
}

export class UpdateCourseActivityDTO implements UpdateActivity {
  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly openAt?: Date | null

  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly closeAt?: Date | null

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  readonly colorHue?: number | null

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  readonly ignoreRestrictions?: boolean

  @Type(() => Object)
  @ApiProperty()
  @IsOptional()
  readonly activitySettings?: ActivitySettings

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]{6}$/)
  @ApiProperty()
  readonly code?: string

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  readonly graded?: boolean
}

export class ReloadCourseActivityDTO implements ReloadActivity {
  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly version?: string
}

export class CreateCourseActivitiesBatchDTO {
  @Type(() => CreateCourseActivityDTO)
  @ApiProperty({ type: [CreateCourseActivityDTO] })
  readonly activities!: CreateCourseActivityDTO[]
}
