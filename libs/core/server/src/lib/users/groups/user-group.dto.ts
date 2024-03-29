import { ApiProperty } from '@nestjs/swagger'
import {
  CreateUserGroup,
  MAX_PAGE_SIZE,
  MIN_PAGE_OFFSET,
  MIN_PAGE_SIZE,
  OrderingDirections,
  UpdateUserGroup,
  UserGroup,
  UserGroupFilters,
  UserGroupOrderings,
} from '@platon/core/common'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'
import { BaseDTO, toNumber } from '../../utils'
import { UserDTO } from '../user.dto'

export class UserGroupDTO extends BaseDTO implements UserGroup {
  @IsString()
  @ApiProperty()
  readonly name!: string

  @IsOptional()
  @IsArray()
  @Type(() => UserDTO)
  readonly users!: UserDTO[]
}

export class CreateUserGroupDTO implements CreateUserGroup {
  @IsString()
  @ApiProperty()
  readonly name!: string

  @IsOptional()
  @IsString({ each: true })
  @ApiProperty()
  readonly users?: string[]
}

export class UpdateUserGroupDTO implements UpdateUserGroup {
  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly name?: string

  @IsOptional()
  @IsString({ each: true })
  @ApiProperty()
  readonly users?: string[]
}

export class UserGroupFiltersDTO implements UserGroupFilters {
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

  @IsEnum(UserGroupOrderings)
  @IsOptional()
  readonly order?: UserGroupOrderings

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections
}
