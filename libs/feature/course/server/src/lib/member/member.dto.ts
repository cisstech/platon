import { ApiProperty } from "@nestjs/swagger";
import { OrderingDirections, UserOrderings } from "@platon/core/common";
import { toBoolean, toNumber } from "@platon/core/server";
import { CourseMember, CourseMemberFilters, CreateCourseMember } from "@platon/feature/course/common";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";


class CourseMemberGroupDTO {
  @IsUUID()
  @ApiProperty()
  id!: string;

  @IsString()
  @ApiProperty()
  name!: string;
}

export class CourseMemberDTO implements CourseMember {
  @IsUUID()
  @ApiProperty()
  readonly userId!: string;

  @IsUUID()
  @ApiProperty()
  readonly courseId!: string;

  @Type(() => CourseMemberGroupDTO)
  readonly group?: CourseMemberGroupDTO;
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
