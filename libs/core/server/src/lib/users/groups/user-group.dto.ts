import { ApiProperty } from '@nestjs/swagger';
import { CreateUserGroup, OrderingDirections, UpdateUserGroup, UserGroup, UserGroupFilters, UserGroupOrderings } from '@platon/core/common';
import { Exclude, Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDTO, toNumber } from '../../utils';

export class UserGroupDTO extends BaseDTO implements UserGroup {
  @IsString()
  @ApiProperty()
  readonly name!: string;

  @Exclude()
  readonly users?: unknown
}

export class CreateUserGroupDTO implements CreateUserGroup {
  @IsString()
  @ApiProperty()
  readonly name!: string;

  @IsOptional()
  @IsString({ each: true })
  @ApiProperty()
  readonly users?: string[];
}

export class UpdateUserGroupDTO implements UpdateUserGroup {
  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly name?: string;

  @IsOptional()
  @IsString({ each: true })
  @ApiProperty()
  readonly users?: string[];
}

export class UserGroupFiltersDTO implements UserGroupFilters {
  @IsString()
  @IsOptional()
  readonly search?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number;

  @IsEnum(UserGroupOrderings)
  @IsOptional()
  readonly order?: UserGroupOrderings;

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections;
}
