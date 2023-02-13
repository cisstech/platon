import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO, LevelDTO, TopicDTO } from '@platon/core/server';
import { CircleTree, CreateResource, Resource, ResourceStatus, ResourceTypes, ResourceVisibilities, UpdateResource } from '@platon/feature/resource/common';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';


export class ResourceDTO extends BaseDTO implements Resource {
  @IsString()
  @ApiProperty()
  name!: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  desc?: string

  @IsEnum(ResourceTypes)
  @ApiProperty()
  type!: ResourceTypes

  @IsEnum(ResourceVisibilities)
  @ApiProperty()
  visibility!: ResourceVisibilities

  @IsEnum(ResourceStatus)
  @ApiProperty()
  status!: ResourceStatus

  @IsArray()
  @Type(() => LevelDTO)
  @ApiProperty()
  levels!: LevelDTO[]

  @IsArray()
  @Type(() => TopicDTO)
  @ApiProperty()
  topics!: TopicDTO[]

  @IsUUID()
  @ApiProperty()
  ownerId!: string

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  parentId?: string
}

export class CircleTreeDTO implements CircleTree {
  @IsUUID()
  @IsOptional()
  @ApiProperty()
  readonly id!: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly name!: string;

  @Type(() => CircleTreeDTO)
  @IsArray()
  @IsOptional()
  @ApiProperty()
  readonly children?: CircleTreeDTO[]
}

export class CreateResourceDTO implements CreateResource {
  @IsString()
  @ApiProperty()
  name!: string

  @IsString()
  @IsOptional()
  @ApiProperty()
  desc?: string

  @IsEnum(ResourceTypes)
  @ApiProperty()
  type!: ResourceTypes

  @IsOptional()
  @IsEnum(ResourceStatus)
  @ApiProperty()
  status?: ResourceStatus

  @IsEnum(ResourceVisibilities)
  @ApiProperty()
  visibility!: ResourceVisibilities

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

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  parentId?: string
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
