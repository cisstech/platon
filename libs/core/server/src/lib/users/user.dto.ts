import { OrderingDirections, UpdateUser, User, UserFilters, UserOrderings, UserRoles } from '@platon/core/common';
import { Exclude, Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEmail, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseDTO, toArray, toNumber } from '../utils';

export class UserDTO extends BaseDTO implements User {
  @IsEnum(UserRoles)
  readonly role!: UserRoles;

  @IsString()
  readonly username!: string;

  @IsBoolean()
  readonly active!: boolean;

  @IsString()
  @IsOptional()
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  readonly lastName?: string;

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsDate()
  @IsOptional()
  readonly lastLogin?: Date;

  @IsDate()
  @IsOptional()
  readonly firstLogin?: Date;

  @Exclude()
  readonly password?: string
}

export class UpdateUserDTO implements UpdateUser {
  @IsOptional()
  @IsEnum(UserRoles)
  readonly role?: UserRoles;

  @IsString()
  @IsOptional()
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  readonly lastName?: string;

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsBoolean()
  @IsOptional()
  readonly active?: boolean;
}

export class UserFiltersDTO implements UserFilters {
  @Transform(({ value }) => toArray(value))
  @IsEnum(UserRoles, { each: true })
  @IsArray()
  @IsOptional()
  readonly roles?: UserRoles[];

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly groups?: string[];

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

  @IsEnum(UserOrderings)
  @IsOptional()
  readonly order?: UserOrderings;

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections;
}
