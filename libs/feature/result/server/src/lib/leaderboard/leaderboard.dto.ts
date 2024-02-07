import { ApiProperty } from '@nestjs/swagger'
import { UserDTO } from '@platon/core/server'
import { ActivityLeaderboardEntry, CourseLeaderboardEntry } from '@platon/feature/result/common'
import { Type } from 'class-transformer'
import { IsNumber } from 'class-validator'

export class CourseLeaderboardActivityGradeDTO {
  @ApiProperty()
  @IsNumber()
  readonly rank!: number

  @ApiProperty()
  @IsNumber()
  readonly grade!: number
}

export class ActivityLeaderboardEntryDTO implements ActivityLeaderboardEntry {
  @ApiProperty()
  @IsNumber()
  readonly rank!: number

  @ApiProperty({ type: UserDTO })
  @Type(() => UserDTO)
  readonly user!: UserDTO

  @ApiProperty()
  @IsNumber()
  readonly grade!: number

  @ApiProperty()
  @IsNumber()
  readonly points!: number

  @ApiProperty({ type: Date })
  @Type(() => Date)
  readonly startedAt!: Date

  @ApiProperty({ type: Date })
  @Type(() => Date)
  readonly lastGradedAt!: Date
}

export class CourseLeaderboardEntryDTO implements CourseLeaderboardEntry {
  @ApiProperty()
  @IsNumber()
  readonly rank!: number

  @ApiProperty({ type: UserDTO })
  @Type(() => UserDTO)
  readonly user!: UserDTO

  @ApiProperty()
  @IsNumber()
  readonly points!: number
}
