import { ApiProperty } from '@nestjs/swagger';
import {
  CourseDemo,
  CourseDemoAccessAnswer,
} from '@platon/feature/course/common';
import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class CourseDemoDTO implements CourseDemo {
  @IsUUID()
  @ApiProperty()
  courseId!: string;

  @IsUUID()
  @ApiProperty()
  uri!: string;
}

export class CourseDemoAccessDTO {
  @IsUUID()
  @ApiProperty()
  uri!: string;
}

export class CourseDemoGetDTO {
  @IsUUID()
  @ApiProperty()
  courseId!: string;
}

export class CourseDemoCreateDTO {
  @IsUUID()
  @ApiProperty()
  courseId!: string;
}

export class CourseDemoDeleteDTO {
  @IsUUID()
  @ApiProperty()
  courseId!: string;
}

export class CourseDemoAccessAnswerDTO implements CourseDemoAccessAnswer {
  @IsUUID()
  @ApiProperty()
  courseId!: string;

  @IsBoolean()
  @ApiProperty()
  auth!: boolean;

  @IsString()
  @ApiProperty()
  accessToken?: string;

  @IsString()
  @ApiProperty()
  refreshToken?: string;
}
