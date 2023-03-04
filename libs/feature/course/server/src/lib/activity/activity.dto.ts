import { ApiProperty } from "@nestjs/swagger";
import { BaseDTO, toNumber } from "@platon/core/server";
import { CourseActivity, CourseActivityFilters, CreateCourseActivity, UpdateCourseActivity } from "@platon/feature/course/common";
import { Transform } from "class-transformer";
import { IsOptional, IsNumber, IsUUID, IsString } from "class-validator";

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

  @IsUUID()
  @ApiProperty()
  readonly resouceId!: string;

  @IsString()
  @ApiProperty()
  readonly resourceVersion!: string;
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
  readonly courseId!: string;

  @IsUUID()
  @ApiProperty()
  readonly sectionId!: string;

  @IsUUID()
  @ApiProperty()
  readonly resouceId!: string;

  @IsString()
  @ApiProperty()
  readonly resourceVersion!: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @ApiProperty()
  readonly order!: number;
}

export class UpdateCourseActivityDTO implements UpdateCourseActivity {

  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @ApiProperty()
  readonly order?: number;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly resourceVersion?: string;

}
