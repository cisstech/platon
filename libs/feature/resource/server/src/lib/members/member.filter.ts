import { OrderingDirections, UserOrderings } from "@platon/core/common";
import { toNumber } from "@platon/core/server";
import { ResourceMemberFilters } from "@platon/feature/resource/common";
import { Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

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
