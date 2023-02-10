import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO, LevelDTO, TopicDTO } from '@platon/core/common';
import { IsArray, IsEnum, IsInstance, IsOptional, IsString, IsUUID } from 'class-validator';
import { JoinTable } from 'typeorm';
import { ResourceStatus } from '../enums/resource-status';
import { ResourceTypes } from '../enums/resource-types';
import { ResourceVisibilities } from '../enums/resource-visibility';

export class ResourceDTO extends BaseDTO {
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
  @JoinTable()
  topics!: TopicDTO[]

  @IsUUID()
  @ApiProperty()
  ownerId!: string

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  parentId?: string
}

export class CreateResourceDTO {
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

export class UpdateResourceDTO {
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
  levels?: string[]

  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  @ApiProperty()
  topics?: string[]
}
