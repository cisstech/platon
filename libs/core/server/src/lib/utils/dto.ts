import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsOptional, IsUUID } from 'class-validator'

export class BaseDTO {
  @IsUUID()
  @ApiProperty()
  readonly id!: string

  @IsDate()
  @ApiProperty()
  readonly createdAt!: Date

  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly updatedAt?: Date
}
