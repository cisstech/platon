import { PartialType } from '@nestjs/swagger'
import { CreateTopic, Topic, UpdateTopic } from '@platon/core/common'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { BaseDTO } from '../utils'

export class TopicDTO extends BaseDTO implements Topic {
  @IsString()
  readonly name!: string

  @IsBoolean()
  existing?: boolean
}

export class CreateTopicDTO implements CreateTopic {
  @IsString()
  readonly name!: string

  @IsBoolean()
  @IsOptional()
  readonly force?: boolean
}

export class UpdateTopicDTO extends PartialType(CreateTopicDTO) implements UpdateTopic {}
