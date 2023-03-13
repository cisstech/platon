import { ApiProperty } from "@nestjs/swagger";
import { BaseDTO, toArray, toDate } from "@platon/core/server";
import { CourseActivity, CourseActivityFilters, CourseActivityStates, CreateCourseActivity, UpdateCourseActivity } from "@platon/feature/course/common";
import { Transform } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CourseActivityDTO extends BaseDTO implements CourseActivity {
  @IsNumber()
  @ApiProperty()
  readonly progression = 0;

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

  @IsString()
  readonly title!: string;

  @IsString()
  readonly state!: CourseActivityStates;
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
  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly openAt?: Date | null;

  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly closeAt?: Date | null;

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsOptional()
  @ApiProperty()
  readonly members?: string[];
}
