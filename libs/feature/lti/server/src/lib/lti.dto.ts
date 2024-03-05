import { MAX_PAGE_SIZE, MIN_PAGE_OFFSET, MIN_PAGE_SIZE, OrderingDirections } from '@platon/core/common'
import { BaseDTO, toNumber } from '@platon/core/server'
import { CreateLms, Lms, LmsFilters, LmsOrdering, UpdateLms } from '@platon/feature/lti/common'
import { Transform } from 'class-transformer'
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator'

export class LmsDTO extends BaseDTO implements Lms {
  @IsString()
  readonly name!: string

  @IsUrl()
  readonly url!: string

  @IsUrl()
  readonly outcomeUrl!: string

  @IsString()
  readonly consumerKey!: string

  @IsString()
  readonly consumerSecret!: string
}

export class CreateLmsDTO implements CreateLms {
  @IsString()
  readonly name!: string

  @IsUrl()
  readonly url!: string

  @IsUrl()
  readonly outcomeUrl!: string

  @IsString()
  readonly consumerKey!: string

  @IsString()
  readonly consumerSecret!: string
}

export class UpdateLmsDTO implements UpdateLms {
  @IsString()
  @IsOptional()
  readonly name?: string

  @IsUrl()
  @IsOptional()
  readonly url?: string

  @IsUrl()
  @IsOptional()
  readonly outcomeUrl?: string

  @IsString()
  @IsOptional()
  readonly consumerKey?: string

  @IsString()
  @IsOptional()
  readonly consumerSecret?: string
}

export class LmsFiltersDTO implements LmsFilters {
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

  @IsEnum(LmsOrdering)
  @IsOptional()
  readonly order?: LmsOrdering

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections
}
