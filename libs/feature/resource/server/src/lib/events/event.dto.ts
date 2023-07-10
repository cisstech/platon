/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseDTO, toNumber } from '@platon/core/server'
import { ResourceEvent, ResourceEventFilters, ResourceEventTypes } from '@platon/feature/resource/common'
import { Transform } from 'class-transformer'
import { IsEnum, IsJSON, IsNumber, IsOptional, IsUUID } from 'class-validator'

export class ResourceEventDTO extends BaseDTO implements ResourceEvent {
  @IsEnum(ResourceEventTypes)
  readonly type!: ResourceEventTypes

  @IsUUID()
  readonly actorId!: string

  @IsUUID()
  readonly resourceId!: string

  @IsJSON()
  readonly data!: Record<string, any>
}

export class ResourceEventFiltersDTO implements ResourceEventFilters {
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number
}
