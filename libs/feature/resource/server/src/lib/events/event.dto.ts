/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseDTO } from '@platon/core/server';
import { ResourceEvent, ResourceEventTypes } from '@platon/feature/resource/common';
import { IsEnum, IsJSON, IsUUID } from 'class-validator';

export class ResourceEventDTO extends BaseDTO implements ResourceEvent {

  @IsEnum(ResourceEventTypes)
  readonly type!: ResourceEventTypes;

  @IsUUID()
  readonly actorId!: string

  @IsUUID()
  readonly resourceId!: string

  @IsJSON()
  readonly data!: Record<string, any>
}
