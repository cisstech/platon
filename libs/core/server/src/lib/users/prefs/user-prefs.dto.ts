import { ApiProperty } from '@nestjs/swagger';
import { UpdateUserPrefs, UserPrefs } from '@platon/core/common';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { LevelDTO } from '../../levels';
import { TopicDTO } from '../../topics';

export class UserPrefsDTO implements UserPrefs {
  @IsArray()
  @Type(() => LevelDTO)
  @ApiProperty()
  levels!: LevelDTO[]

  @IsArray()
  @Type(() => TopicDTO)
  @ApiProperty()
  topics!: TopicDTO[]
}

export class UpdateUserPrefsDTO implements UpdateUserPrefs {

  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  levels?: string[]

  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  topics?: string[]
}
