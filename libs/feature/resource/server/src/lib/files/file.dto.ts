import { toBoolean } from '@platon/core/server'
import { FileCreate, FileMove, FileRelease, FileRetrieve, FileUpdate } from '@platon/feature/resource/common'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class FileRetrieveDTO implements Partial<FileRetrieve> {
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  stat?: boolean

  @IsString()
  @IsOptional()
  version?: string

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  bundle?: boolean

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  versions?: boolean

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  describe?: boolean

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  download?: boolean

  @IsString()
  @IsOptional()
  search?: string

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  use_regex?: boolean

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  match_word?: boolean

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  match_case?: boolean

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  zipList?: boolean
}

export class FileCreateDTO implements FileCreate {
  @IsString()
  path!: string

  @IsString()
  content?: string
}

export class FileUpdateDTO implements FileUpdate {
  @IsString()
  @IsOptional()
  content?: string | null
}

export class FileMoveDTO implements FileMove {
  @IsBoolean()
  @IsOptional()
  copy?: boolean

  @IsBoolean()
  @IsOptional()
  unzip?: boolean

  @IsString()
  @IsOptional()
  unzipFile?: string

  @IsBoolean()
  @IsOptional()
  rename?: boolean

  @IsString()
  @IsOptional()
  destination?: string
}

export class FileReleaseDTO implements FileRelease {
  @IsString()
  name!: string
  @IsString()
  message!: string
}
