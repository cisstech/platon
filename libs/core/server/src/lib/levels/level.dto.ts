import { PartialType } from '@nestjs/swagger'
import { CreateLevel, Level, UpdateLevel } from '@platon/core/common'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { BaseDTO } from '../utils'

export class LevelDTO extends BaseDTO implements Level {
  @IsString()
  readonly name!: string

  @IsBoolean()
  existing?: boolean
}

export class CreateLevelDTO implements CreateLevel {
  @IsString()
  readonly name!: string

  @IsBoolean()
  @IsOptional()
  readonly force?: boolean
}

export class UpdateLevelDTO extends PartialType(CreateLevelDTO) implements UpdateLevel {}
