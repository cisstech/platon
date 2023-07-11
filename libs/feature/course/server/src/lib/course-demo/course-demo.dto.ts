import { ApiProperty } from '@nestjs/swagger'
import { CourseDemo, CourseDemoAccessResponse,
  CourseDemoGetResponse } from '@platon/feature/course/common'
import { IsBoolean, IsString, IsUUID, ValidateNested } from 'class-validator'

export class CourseDemoDTO implements CourseDemo {
  @IsUUID()
  @ApiProperty()
  courseId!: string

  @IsUUID()
  @ApiProperty()
  uri!: string
}

export class CourseDemoAccessDTO {
  @IsUUID()
  @ApiProperty()
  uri!: string
}

export class CourseDemoGetRequestDTO {
  @IsUUID()
  @ApiProperty()
  courseId!: string;
}

export class CourseDemoGetResponseDTO implements CourseDemoGetResponse {
  @IsBoolean()
  @ApiProperty()
  demoExists!: boolean;

  @ValidateNested()
  demo?: CourseDemoDTO;
}

export class CourseDemoCreateDTO {
  @IsUUID()
  @ApiProperty()
  courseId!: string
}

export class CourseDemoDeleteDTO {
  @IsUUID()
  @ApiProperty()
  courseId!: string
}

export class CourseDemoAccessAnswerDTO implements CourseDemoAccessResponse {
  @IsUUID()
  @ApiProperty()
  courseId!: string

  @IsBoolean()
  @ApiProperty()
  auth!: boolean

  @IsString()
  @ApiProperty()
  accessToken?: string

  @IsString()
  @ApiProperty()
  refreshToken?: string
}
