import { ApiProperty } from '@nestjs/swagger'
import { CourseStatistic } from '@platon/feature/course/common'
import { IsNumber } from 'class-validator'

export class CourseStatisticDTO implements CourseStatistic {
  @IsNumber()
  @ApiProperty()
  readonly timeSpent = 0

  @IsNumber()
  @ApiProperty()
  readonly progression = 0

  @IsNumber()
  @ApiProperty()
  readonly studentCount = 0

  @IsNumber()
  @ApiProperty()
  readonly teacherCount = 0

  @IsNumber()
  @ApiProperty()
  readonly activityCount = 0
}
