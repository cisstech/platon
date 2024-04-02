import { ApiProperty } from '@nestjs/swagger'
import { MAX_PAGE_SIZE, MIN_PAGE_OFFSET, MIN_PAGE_SIZE, OrderingDirections, UserOrderings } from '@platon/core/common'
import { BaseDTO, toBoolean, toNumber } from '@platon/core/server'
import {
  CreateResourceMember,
  ResourceMember,
  ResourceMemberFilters,
  UpdateResourceMember,
} from '@platon/feature/resource/common'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'
import { MemberPermissionsDTO } from '../permissions'

export class ResourceMemberDTO extends BaseDTO implements ResourceMember {
  @IsUUID()
  @ApiProperty()
  userId!: string

  @IsUUID()
  @ApiProperty()
  resourceId!: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  waiting?: boolean

  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions!: MemberPermissionsDTO
}

export class CreateResourceMemberDTO implements CreateResourceMember {
  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions!: MemberPermissionsDTO
}

export class UpdateResourceMemberDTO implements UpdateResourceMember {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  waiting?: boolean

  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions?: MemberPermissionsDTO
}

export class ResourceMemberFiltersDTO implements ResourceMemberFilters {
  @IsString()
  @IsOptional()
  readonly search?: string

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  readonly waiting?: boolean

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
