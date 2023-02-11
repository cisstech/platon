import { ApiProperty } from '@nestjs/swagger';
import { UpdateUserPrefs, UserPrefs } from '@platon/core/common';
import { IsArray, IsInstance, IsOptional, IsUUID } from 'class-validator';
import { LevelDTO } from '../../levels';
import { TopicDTO } from '../../topics';

export class UserPrefsDTO implements UserPrefs {
  @IsArray()
  @IsInstance(LevelDTO)
  @ApiProperty()
  levels!: LevelDTO[]

  @IsArray()
  @IsInstance(TopicDTO)
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
