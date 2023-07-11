import { ApiProperty } from '@nestjs/swagger'
import { OrderingDirections } from '@platon/core/common'
import { BaseDTO, LevelDTO, toArray, toBoolean, toNumber, TopicDTO } from '@platon/core/server'
import {
  CircleTree,
  CreateResource,
  Resource,
  ResourceFilters,
  ResourceOrderings,
  ResourceStatus,
  ResourceTypes,
  ResourceVisibilities,
  UpdateResource,
} from '@platon/feature/resource/common'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'

export class ResourceDTO extends BaseDTO implements Resource {
  @IsString()
  @ApiProperty()
  readonly name!: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly code?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly desc?: string

  @IsEnum(ResourceTypes)
  @ApiProperty()
  readonly type!: ResourceTypes

  @IsEnum(ResourceVisibilities)
  @ApiProperty()
  readonly visibility!: ResourceVisibilities

  @IsEnum(ResourceStatus)
  @ApiProperty()
  readonly status!: ResourceStatus

  @IsArray()
  @Type(() => LevelDTO)
  @ApiProperty()
  readonly levels!: LevelDTO[]

  @IsArray()
  @Type(() => TopicDTO)
  @ApiProperty()
  readonly topics!: TopicDTO[]

  @IsUUID()
  @ApiProperty()
  readonly ownerId!: string

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  readonly parentId?: string
}

export class CircleTreeDTO implements CircleTree {
  @IsUUID()
  @ApiProperty()
  readonly id!: string

  @IsString()
  @ApiProperty()
  readonly name!: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly code?: string

  @IsEnum(ResourceVisibilities)
  @ApiProperty()
  readonly visibility!: ResourceVisibilities

  @Type(() => CircleTreeDTO)
  @IsArray()
  @IsOptional()
  @ApiProperty()
  readonly children?: CircleTreeDTO[]
}

export class CreateResourceDTO implements CreateResource {
  @IsString()
  @ApiProperty()
  readonly name!: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly code?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly desc?: string

  @IsEnum(ResourceTypes)
  @ApiProperty()
  readonly type!: ResourceTypes

  @IsOptional()
  @IsEnum(ResourceStatus)
  @ApiProperty()
  readonly status?: ResourceStatus

  @IsEnum(ResourceVisibilities)
  @ApiProperty()
  readonly visibility!: ResourceVisibilities

  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  readonly levels?: string[]

  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  readonly topics?: string[]

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  readonly parentId?: string
}

export class UpdateResourceDTO implements UpdateResource {
  @IsString()
  @IsOptional()
  @ApiProperty()
  name?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  desc?: string

  @IsEnum(ResourceStatus)
  @IsOptional()
  @ApiProperty()
  status?: ResourceStatus

  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  levels?: string[] = []

  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  topics?: string[] = []
}

export class ResourceFiltersDTO implements ResourceFilters {
  @Transform(({ value }) => toArray(value))
  @IsEnum(ResourceTypes, { each: true })
  @IsArray()
  @IsOptional()
  readonly types?: ResourceTypes[]

  @Transform(({ value }) => toArray(value))
  @IsEnum(ResourceStatus, { each: true })
  @IsArray()
  @IsOptional()
  readonly status?: ResourceStatus[]

  @IsString()
  @IsOptional()
  readonly search?: string

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly period?: number

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly members?: string[]

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly watchers?: string[]

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly owners?: string[]

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  readonly views?: boolean

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number

  @IsUUID()
  @IsOptional()
  readonly parent?: string

  @IsEnum(ResourceOrderings)
  @IsOptional()
  readonly order?: ResourceOrderings

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections
}
