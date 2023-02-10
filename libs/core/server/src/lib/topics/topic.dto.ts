import { PartialType } from '@nestjs/swagger';
import { CreateTopic, Topic, UpdateTopic } from '@platon/core/common';
import { IsString } from 'class-validator';
import { BaseDTO } from '../utils';

export class TopicDTO extends BaseDTO implements Topic {
  @IsString()
  readonly name!: string;
}

export class CreateTopicDTO implements CreateTopic {
  @IsString()
  readonly name!: string;
}

export class UpdateTopicDTO extends PartialType(CreateTopicDTO) implements UpdateTopic {}
