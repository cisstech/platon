import { ApiProperty } from '@nestjs/swagger'
import { MAX_PAGE_SIZE, MIN_PAGE_OFFSET, MIN_PAGE_SIZE, OrderingDirections } from '@platon/core/common'
import { BaseDTO, LevelDTO, TopicDTO, toArray, toBoolean, toNumber } from '@platon/core/server'
import { ActivityNavigationModes } from '@platon/feature/compiler'
import {
  CircleTree,
  CreatePreviewResource,
  CreateResource,
  Resource,
  ResourceFilters,
  ResourceOrderings,
  ResourcePermissions,
  ResourceStatus,
  ResourceTypes,
  UpdateResource,
} from '@platon/feature/resource/common'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'
import { FileCreateDTO } from './files'
import { ResourcePermissionsDTO } from './permissions'

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

  @IsBoolean()
  @ApiProperty()
  readonly personal!: boolean

  @IsBoolean()
  @ApiProperty()
  readonly publicPreview!: boolean

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

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  readonly templateId?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly templateVersion?: string

  @Type(() => ResourcePermissionsDTO)
  @ApiProperty()
  readonly permissions!: ResourcePermissions
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

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  readonly versions?: string[]

  @Type(() => CircleTreeDTO)
  @IsArray()
  @IsOptional()
  @ApiProperty()
  readonly children?: CircleTreeDTO[]

  @Type(() => ResourcePermissionsDTO)
  @ApiProperty()
  readonly permissions?: ResourcePermissions
}

export class CreateResourceDTO implements CreateResource {
  @IsString()
  @ApiProperty()
  readonly name!: string

  @IsUUID()
  @ApiProperty()
  readonly parentId!: string

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  readonly templateId?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly templateVersion?: string

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

  @IsOptional()
  @Type(() => FileCreateDTO)
  @IsArray()
  @ApiProperty({ required: false })
  files?: FileCreateDTO[]
}

export class CreatePreviewResourceDTO implements CreatePreviewResource {
  @Type(() => FileCreateDTO)
  @IsArray()
  @ApiProperty()
  files!: FileCreateDTO[]
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

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  publicPreview!: boolean

  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  levels?: string[]

  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  topics?: string[]
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
  readonly dependOn?: string[]

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly usedBy?: string[]

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly owners?: string[]

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  readonly views?: boolean

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  readonly personal?: boolean

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  readonly publicPreview?: boolean

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  readonly configurable?: boolean

  @IsString()
  @IsOptional()
  readonly navigation?: ActivityNavigationModes

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly topics?: string[]

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly antiTopics?: string[]

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly levels?: string[]

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

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly parents?: string[]

  @IsEnum(ResourceOrderings)
  @IsOptional()
  readonly order?: ResourceOrderings

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections
}
