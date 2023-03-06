import { ApiProperty } from "@nestjs/swagger";
import { BaseDTO, toArray, toDate, toNumber } from "@platon/core/server";
import { CourseActivity, CourseActivityFilters, CreateCourseActivity, UpdateCourseActivity } from "@platon/feature/course/common";
import { Transform } from "class-transformer";
import { IsOptional, IsNumber, IsUUID, IsString, IsDate } from "class-validator";

export class CourseActivityDTO extends BaseDTO implements CourseActivity {
  @IsNumber()
  @ApiProperty()
  readonly order!: number;


  @IsUUID()
  @ApiProperty()
  readonly courseId!: string;

  @IsUUID()
  @ApiProperty()
  readonly sectionId!: string;


  @IsOptional()
  @IsDate()
  readonly openAt?: Date;

  @IsOptional()
  @IsDate()
  readonly closeAt?: Date;
}

export class CourseActivityFiltersDTO implements CourseActivityFilters {
  @IsOptional()
  @IsUUID()
  @ApiProperty()
  readonly sectionId?: string;
}

export class CreateCourseActivityDTO implements CreateCourseActivity {
  @IsUUID()
  @ApiProperty()
  readonly sectionId!: string;


  @IsUUID()
  @ApiProperty()
  readonly resourceId!: string;

  @IsString()
  @ApiProperty()
  readonly resourceVersion!: string;


  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly openAt?: Date;

  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly closeAt?: Date;

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsOptional()
  @ApiProperty()
  readonly members?: string[];
}

export class UpdateCourseActivityDTO implements UpdateCourseActivity {

  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @ApiProperty()
  readonly order?: number;

  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly openAt?: Date;

  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly closeAt?: Date;

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsOptional()
  @ApiProperty()
  readonly members?: string[];
}
