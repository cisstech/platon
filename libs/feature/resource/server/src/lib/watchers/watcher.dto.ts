import { MAX_PAGE_SIZE, MIN_PAGE_OFFSET, MIN_PAGE_SIZE, OrderingDirections, UserOrderings } from '@platon/core/common'
import { toNumber } from '@platon/core/server'
import { ResourceWatcherFilters } from '@platon/feature/resource/common'
import { Transform } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class ResourceWatcherFiltersDTO implements ResourceWatcherFilters {
  @IsString()
  @IsOptional()
  readonly search?: string

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

  @IsEnum(UserOrderings)
  @IsOptional()
  readonly order?: UserOrderings

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections
}
