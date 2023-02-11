/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResourceCompletion } from '@platon/feature/resource/common';
import { IsArray, IsString } from 'class-validator';

export class ResourceCompletionDTO implements ResourceCompletion {
  @IsString({ each: true })
  @IsArray()
  readonly names!: string[]

  @IsString({ each: true })
  @IsArray()
  topics!: string[]

  @IsString({ each: true })
  @IsArray()
  levels!: string[]
}
