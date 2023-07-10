import { Field, InputType, Int } from '@nestjs/graphql'
import {
  OrderingDirections,
  UpdateUser,
  User,
  UserFilters,
  UserOrderings,
  UserRoles,
} from '@platon/core/common'
import { Exclude, Expose, Transform } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { UUID } from '../graphql'
import { BaseDTO, toArray, toNumber } from '../utils'

export class UserDTO extends BaseDTO implements User {
  @IsEnum(UserRoles)
  readonly role!: UserRoles

  @IsString()
  readonly username!: string

  @IsBoolean()
  readonly active!: boolean

  @IsString()
  @IsOptional()
  readonly firstName?: string

  @IsString()
  @IsOptional()
  readonly lastName?: string

  @IsEmail()
  @IsOptional()
  readonly email?: string

  @IsDate()
  @IsOptional()
  readonly lastLogin?: Date

  @IsDate()
  @IsOptional()
  readonly firstLogin?: Date

  @Exclude()
  readonly password?: string

  @IsBoolean()
  @IsOptional()
  readonly hasPassword?: boolean
}

export class UpdateUserDTO implements UpdateUser {
  @IsOptional()
  @IsEnum(UserRoles)
  readonly role?: UserRoles

  @IsString()
  @IsOptional()
  readonly firstName?: string

  @IsString()
  @IsOptional()
  readonly lastName?: string

  @IsEmail()
  @IsOptional()
  readonly email?: string

  @IsBoolean()
  @IsOptional()
  readonly active?: boolean
}

@InputType()
export class UserFiltersDTO implements UserFilters {
  @Field(() => [UserRoles], { nullable: true })
  @Transform(({ value }) => toArray(value))
  @IsEnum(UserRoles, { each: true })
  @IsOptional()
  readonly roles?: UserRoles[]

  @Field(() => [UUID], { nullable: true })
  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly groups?: string[]

  @Field(() => [UUID], { nullable: true })
  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly lmses?: string[]

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  readonly search?: string

  @Field(() => Int, { nullable: true })
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number

  @Field(() => Int, { nullable: true })
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number

  @Field(() => UserOrderings, { nullable: true })
  @IsEnum(UserOrderings)
  @IsOptional()
  readonly order?: UserOrderings

  @Field(() => OrderingDirections, { nullable: true })
  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections
}
