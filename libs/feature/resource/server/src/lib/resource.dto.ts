import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO, LevelDTO, TopicDTO } from '@platon/core/server';
import { CircleTree, CreateResource, Resource, ResourceStatus, ResourceTypes, ResourceVisibilities, UpdateResource, PreviewResource } from '@platon/feature/resource/common';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';


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

  @IsBoolean()
  @ApiProperty()
  readonly isModel!: boolean

  @IsUUID()
  @ApiProperty()
  readonly ownerId!: string

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  readonly modelId?: string

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  readonly parentId?: string
}

export class CircleTreeDTO implements CircleTree {
  @IsUUID()
  @ApiProperty()
  readonly id!: string;

  @IsString()
  @ApiProperty()
  readonly name!: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly code?: string;

  @IsEnum(ResourceVisibilities)
  @ApiProperty()
  readonly visibility!: ResourceVisibilities;

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

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  readonly isModel?: boolean

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  readonly modelId?: string

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

export class PreviewResourceDTO implements PreviewResource {
  @IsString()
  @IsOptional()
  @ApiProperty()
  version?: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  content?: string
}
