import { toBoolean } from "@platon/core/server";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export enum FileMoveActions {
  move = 'move',
  copy = 'copy'
}

export class FileRetrieveDTO {
  @IsString()
  @IsOptional()
  version?: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  bundle?: boolean;


  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  versions?: boolean;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  describe?: boolean;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  download?: boolean;

  @IsString()
  @IsOptional()
  search?: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  use_regex?: boolean;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  match_word?: boolean;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  match_case?: boolean;
}

export class FileCreateDTO {
  @IsString()
  path!: string;

  @IsString()
  content?: string;
}

export class FileUpdateDTO {
  @IsString()
  content!: string;
}

export class FileMoveDTO {
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  copy?: boolean;

  @IsString()
  destination!: string;
}


export class FileReleaseDTO {
  @IsString()
  name!: string;
  @IsString()
  message!: string;
}
