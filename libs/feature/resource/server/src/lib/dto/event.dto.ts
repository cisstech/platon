/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseDTO } from '@platon/core/server';
import { ResourceEvent } from '@platon/feature/resource/common';
import { IsJSON, IsUUID } from 'class-validator';

export class ResourceEventDTO extends BaseDTO implements ResourceEvent {
  @IsUUID()
  actorId!: string

  @IsUUID()
  resourceId!: string

  @IsJSON()
  data!: Record<string, any>
}
