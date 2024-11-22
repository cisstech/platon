import { ApiProperty } from '@nestjs/swagger'
import { MAX_PAGE_SIZE, MIN_PAGE_OFFSET, MIN_PAGE_SIZE, OrderingDirections, UserOrderings } from '@platon/core/common'
import { BaseDTO, UserDTO, UserGroupDTO, toArray, toBoolean, toNumber } from '@platon/core/server'
import {
  CourseMember,
  CourseMemberFilters,
  CourseMemberRoles,
  CreateCourseMember,
  UpdateCourseMemberRole,
} from '@platon/feature/course/common'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'

export class CourseMemberDTO extends BaseDTO implements CourseMember {
  @IsUUID()
  @ApiProperty()
  readonly courseId!: string

  @IsOptional()
  @Type(() => UserDTO)
  readonly user?: UserDTO

  @IsOptional()
  @Type(() => UserGroupDTO)
  readonly group?: UserGroupDTO

  @IsOptional()
  @IsEnum(CourseMemberRoles)
  readonly role?: CourseMemberRoles
}

export class UpdateCourseMemberRoleDTO implements UpdateCourseMemberRole {
  @IsUUID()
  readonly id!: string

  @IsEnum(CourseMemberRoles)
  readonly role!: CourseMemberRoles
}

export class CreateCourseMemberDTO implements CreateCourseMember {
  @IsUUID()
  readonly id!: string

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  readonly isGroup?: boolean

  @IsEnum(CourseMemberRoles)
  readonly role!: CourseMemberRoles
}

export class CourseMemberFiltersDTO implements CourseMemberFilters {
  @Transform(({ value }) => toArray(value))
  @IsEnum(CourseMemberRoles, { each: true })
  @IsOptional()
  readonly roles?: CourseMemberRoles[]

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsOptional()
  readonly activities?: string[]

  @IsString()
  @IsOptional()
  readonly search?: string

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

  @IsEnum(UserOrderings)
  @IsOptional()
  readonly order?: UserOrderings

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections
}
