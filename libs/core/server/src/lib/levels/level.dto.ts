import { PartialType } from '@nestjs/swagger';
import { CreateLevel, Level, UpdateLevel } from '@platon/core/common';
import { IsString } from 'class-validator';
import { BaseDTO } from '../utils';

export class LevelDTO extends BaseDTO implements Level {
  @IsString()
  readonly name!: string;
}

export class CreateLevelDTO implements CreateLevel {
  @IsString()
  readonly name!: string;
}

export class UpdateLevelDTO extends PartialType(CreateLevelDTO) implements UpdateLevel {}
