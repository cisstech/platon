import { ApiProperty } from "@nestjs/swagger";
import { ActivityLayout, ExerciseGroupNavItem, ExerciseLayout, ExerciseNavItem, PlayerInput } from "@platon/feature/player/common";
import { IsArray, IsBoolean, IsInstance, IsOptional, IsString } from "class-validator";

export class PlayerInputDTO implements PlayerInput {
  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isPreview?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty()
  resourceId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  resourceVersion?: string;
}

export class ExerciseNavItemDTO implements ExerciseNavItem {
  @IsOptional()
  @IsString()
  @ApiProperty()
  id!: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  title!: string;
}


export class ExerciseGroupNavItemDTO implements ExerciseGroupNavItem {
  @IsOptional()
  @IsString()
  @ApiProperty()
  title!: string;

  @IsArray()
  @IsInstance(ExerciseNavItemDTO, { each: true })
  @ApiProperty()
  exercises!: ExerciseNavItemDTO[];
}

export class ExerciseLayoutDTO implements ExerciseLayout {
  @IsOptional()
  @IsString()
  @ApiProperty()
  type!: 'exercise';

  @IsOptional()
  @IsString()
  @ApiProperty()
  title!: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  statement!: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  form!: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  envid!: string;
}

export class ActivityLayoutDTO implements ActivityLayout {
  @IsOptional()
  @IsString()
  @ApiProperty()
  type!: 'activity';

  @IsOptional()
  @IsString()
  @ApiProperty()
  title!: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  intro!: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  envid!: string;

  navigation!: (ExerciseNavItemDTO | ExerciseGroupNavItemDTO)[];
}

export declare type ResourceLayoutDTO = ExerciseLayoutDTO | ActivityLayoutDTO;
