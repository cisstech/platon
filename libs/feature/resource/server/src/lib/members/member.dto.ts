import { ApiProperty } from '@nestjs/swagger'
import { OrderingDirections, UserOrderings } from '@platon/core/common'
import { BaseDTO, toNumber } from '@platon/core/server'
import {
  CreateResourceMember,
  ResourceMember,
  ResourceMemberFilters,
  UpdateResourceMember,
} from '@platon/feature/resource/common'
import { Transform, Type } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { MemberPermissionsDTO } from '../permissions'

export class ResourceMemberDTO extends BaseDTO implements ResourceMember {
  @IsUUID()
  @ApiProperty()
  userId!: string

  @IsUUID()
  @ApiProperty()
  resourceId!: string

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
  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions?: MemberPermissionsDTO
}

export class ResourceMemberFiltersDTO implements ResourceMemberFilters {
  @IsString()
  @IsOptional()
  readonly search?: string

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number

  @IsEnum(UserOrderings)
  @IsOptional()
  readonly order?: UserOrderings

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections
}
