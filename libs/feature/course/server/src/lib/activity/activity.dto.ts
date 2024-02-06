import { ApiProperty } from '@nestjs/swagger'
import { BaseDTO, toArray, toDate } from '@platon/core/server'
import {
  Activity,
  ActivityFilters,
  ActivityOpenStates,
  CreateActivity,
  ReloadActivity,
  UpdateActivity,
} from '@platon/feature/course/common'
import { Exclude, Transform, Type } from 'class-transformer'
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { ActivityPermissionsDTO } from '../permissions/permissions.dto'

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
  readonly state!: ActivityOpenStates

  @IsNumber()
  @ApiProperty()
  readonly timeSpent = 0

  @IsNumber()
  @ApiProperty()
  readonly progression = 0

  @Type(() => ActivityPermissionsDTO)
  readonly permissions!: ActivityPermissionsDTO

  @Exclude()
  readonly source?: unknown
}

export class ActivityFiltersDTO implements ActivityFilters {
  @IsOptional()
  @IsUUID()
  @ApiProperty()
  readonly sectionId?: string
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
}

export class ReloadCourseActivityDTO implements ReloadActivity {
  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly version?: string
}
