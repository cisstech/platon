import { ApiProperty } from '@nestjs/swagger'
import { MAX_PAGE_SIZE, MIN_PAGE_OFFSET, MIN_PAGE_SIZE, OrderingDirections } from '@platon/core/common'
import { BaseDTO, toArray, toNumber } from '@platon/core/server'
import { Course, CourseFilters, CourseOrderings, CreateCourse, UpdateCourse } from '@platon/feature/course/common'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'
import { CourseStatisticDTO } from './course-statistic/course-statistic.dto'
import { CoursePermissionsDTO } from './permissions/permissions.dto'

export class CourseDTO extends BaseDTO implements Course {
  @IsString()
  @ApiProperty()
  readonly name!: string

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly desc?: string

  @IsUUID()
  @ApiProperty()
  readonly ownerId!: string

  @IsOptional()
  @ApiProperty({ type: CourseStatisticDTO })
  @Type(() => CourseStatisticDTO)
  readonly statistic?: CourseStatisticDTO

  @IsOptional()
  @ApiProperty({ type: CoursePermissionsDTO })
  @Type(() => CoursePermissionsDTO)
  readonly permissions?: CoursePermissionsDTO
}

export class CreateCourseDTO implements CreateCourse {
  @IsString()
  @ApiProperty()
  readonly name!: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly code?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly desc?: string
}

export class UpdateCourseDTO implements UpdateCourse {
  @IsString()
  @IsOptional()
  @ApiProperty()
  name?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  desc?: string
}

export class CourseFiltersDTO implements CourseFilters {
  @IsString()
  @IsOptional()
  readonly search?: string

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly period?: number

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly members?: string[]

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  @Min(MIN_PAGE_OFFSET)
  readonly offset?: number

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  @Min(MIN_PAGE_SIZE)
  @Max(MAX_PAGE_SIZE)
  readonly limit?: number

  @IsEnum(CourseOrderings)
  @IsOptional()
  readonly order?: CourseOrderings

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  readonly showAll?: boolean
}
