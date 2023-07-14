import { BaseDTO, toNumber } from '@platon/core/server'
import {
  ResourceEvent,
  ResourceEventData,
  ResourceEventFilters,
  ResourceEventTypes,
} from '@platon/feature/resource/common'
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
  readonly data!: ResourceEventData
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
