import { ApiProperty } from '@nestjs/swagger'
import { ResourceStatisic } from '@platon/feature/resource/common'
import { IsNumber } from 'class-validator'

export class ResourceStatisticDTO implements ResourceStatisic {
  @IsNumber()
  @ApiProperty()
  members!: number

  @IsNumber()
  @ApiProperty()
  watchers!: number

  @IsNumber()
  @ApiProperty()
  events!: number

  @IsNumber()
  @ApiProperty()
  children!: number

  @IsNumber()
  @ApiProperty()
  circles!: number

  @IsNumber()
  @ApiProperty()
  activities!: number

  @IsNumber()
  @ApiProperty()
  exercises!: number

  @IsNumber()
  @ApiProperty()
  ready!: number

  @IsNumber()
  @ApiProperty()
  deprecated!: number

  @IsNumber()
  @ApiProperty()
  bugged!: number

  @IsNumber()
  @ApiProperty()
  not_tested!: number

  @IsNumber()
  @ApiProperty()
  draft!: number

  @IsNumber()
  @ApiProperty()
  score!: number
}
