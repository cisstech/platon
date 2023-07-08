import { ApiProperty } from '@nestjs/swagger'
import { BaseDTO, toNumber } from '@platon/core/server'
import {
  CourseSection,
  CreateCourseSection,
  UpdateCourseSection,
} from '@platon/feature/course/common'
import { Transform } from 'class-transformer'
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'

export class CourseSectionDTO extends BaseDTO implements CourseSection {
  @IsString()
  @ApiProperty()
  readonly name!: string

  @IsNumber()
  @ApiProperty()
  readonly order!: number

  @IsUUID()
  @ApiProperty()
  readonly courseId!: string
}

export class CreateCourseSectionDTO implements CreateCourseSection {
  @IsString()
  @ApiProperty()
  readonly name!: string

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @ApiProperty()
  readonly order!: number
}

export class UpdateCourseSectionDTO implements UpdateCourseSection {
  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly name?: string

  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @ApiProperty()
  readonly order?: number
}
