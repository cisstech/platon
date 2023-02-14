import { toNumber } from "@platon/core/server";
import { ResourceEventFilters } from "@platon/feature/resource/common";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

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
