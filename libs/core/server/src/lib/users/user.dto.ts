import { UpdateUser, User, UserRoles } from '@platon/core/common';
import { IsBoolean, IsDate, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from '../utils';

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
