import { ApiProperty } from "@nestjs/swagger";
import { OrderingDirections, UserOrderings, UserRoles } from "@platon/core/common";
import { BaseDTO, toArray, toBoolean, toNumber, UserGroupDTO } from "@platon/core/server";
import { CourseMember, CourseMemberFilters, CreateCourseMember } from "@platon/feature/course/common";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";


export class CourseMemberDTO extends BaseDTO implements CourseMember {
  @IsUUID()
  @ApiProperty()
  readonly courseId!: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty()
  readonly userId?: string;

  @IsOptional()
  @Type(() => UserGroupDTO)
  readonly group?: UserGroupDTO;
}

export class CreateCourseMemberDTO implements CreateCourseMember {
  @IsUUID()
  readonly id!: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  readonly isGroup?: boolean;
}


export class CourseMemberFiltersDTO implements CourseMemberFilters {
  @Transform(({ value }) => toArray(value))
  @IsEnum(UserRoles, { each: true })
  @IsOptional()
  readonly roles?: UserRoles[];

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsOptional()
  readonly activities?: string[];

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
