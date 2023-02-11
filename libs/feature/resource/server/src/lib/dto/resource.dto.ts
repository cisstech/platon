import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO, LevelDTO, TopicDTO } from '@platon/core/server';
import { CreateResource, Resource, ResourceStatus, ResourceTypes, ResourceVisibilities, UpdateResource } from '@platon/feature/resource/common';
import { IsArray, IsEnum, IsInstance, IsOptional, IsString, IsUUID } from 'class-validator';

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
  @IsInstance(LevelDTO)
  @ApiProperty()
  levels!: LevelDTO[]

  @IsArray()
  @IsInstance(TopicDTO)
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
