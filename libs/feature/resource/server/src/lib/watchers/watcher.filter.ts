import { OrderingDirections, UserOrderings } from "@platon/core/common";
import { toArray, toBoolean, toNumber } from "@platon/core/server";
import { ResourceEventFilters, ResourceFilters, ResourceMemberFilters, ResourceOrderings, ResourceStatus, ResourceTypes, ResourceWatcherFilters } from "@platon/feature/resource/common";
import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

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

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly watchers?: string[];

  @Transform(({ value }) => toArray(value))
  @IsUUID(undefined, { each: true })
  @IsArray()
  @IsOptional()
  readonly owners?: string[];

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  readonly views?: boolean;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number;

  @IsUUID()
  @IsOptional()
  readonly parent?: string;

  @IsEnum(ResourceOrderings)
  @IsOptional()
  readonly order?: ResourceOrderings;

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections;
}

export class ResourceMemberFiltersDTO implements ResourceMemberFilters {
  @IsString()
  @IsOptional()
  readonly search?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number;

  @IsEnum(UserOrderings)
  @IsOptional()
  readonly order?: UserOrderings;

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections;
}

export class ResourceWatcherFiltersDTO implements ResourceWatcherFilters {
  @IsString()
  @IsOptional()
  readonly search?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number;

  @IsEnum(UserOrderings)
  @IsOptional()
  readonly order?: UserOrderings;

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections;
}

export class ResourceEventFiltersDTO implements ResourceEventFilters {
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number;
}
