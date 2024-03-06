import { MAX_PAGE_SIZE, MIN_PAGE_OFFSET, MIN_PAGE_SIZE } from '@platon/core/common'
import { BaseDTO, toNumber } from '@platon/core/server'
import {
  ResourceEvent,
  ResourceEventData,
  ResourceEventFilters,
  ResourceEventTypes,
} from '@platon/feature/resource/common'
import { Transform } from 'class-transformer'
import { IsEnum, IsJSON, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator'
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
  @Min(MIN_PAGE_OFFSET)
  readonly offset?: number

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  @Min(MIN_PAGE_SIZE)
  @Max(MAX_PAGE_SIZE)
  readonly limit?: number
}
