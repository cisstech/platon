/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from '@platon/core/common';
import { IsJSON, IsUUID } from 'class-validator';


export class ResourceEventDTO extends BaseDTO {
  @IsUUID()
  @ApiProperty()
  actorId!: string

  @IsUUID()
  @ApiProperty()
  resourceId!: string

  @IsJSON()
  @ApiProperty()
  data!: Record<string, any>
}

