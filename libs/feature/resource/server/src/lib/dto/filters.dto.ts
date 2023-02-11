import { OrderingDirections } from "@platon/core/common";
import { toArray, toNumber } from "@platon/core/server";
import { ResourceFilters, ResourceOrderings, ResourceStatus, ResourceTypes, ResourceVisibilities } from "@platon/feature/resource/common";
import { Transform } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class ResourceFiltersDTO implements ResourceFilters {
  @Transform(({ value }) => toArray(value))
  @IsEnum(ResourceTypes, { each: true })
  @IsArray()
  @IsOptional()
  readonly types?: ResourceTypes[];


  @Transform(({ value }) => toArray(value))
  @IsEnum(ResourceStatus, { each: true })
  @IsArray()
  @IsOptional()
  readonly status?: ResourceStatus[];

  @Transform(({ value }) => toArray(value))
  @IsEnum(ResourceVisibilities, { each: true })
  @IsArray()
  @IsOptional()
  readonly visibilities?: ResourceVisibilities[];

  @IsString()
  @IsOptional()
  readonly search?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly period?: number;

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly members?: string[];

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number;

  @IsEnum(ResourceOrderings)
  @IsOptional()
  readonly order?: ResourceOrderings;

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections;
}
