import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsUrl,
  IsNumber,
  Min,
} from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { BaseDTO, UserDTO } from '@platon/core/server'
import {
  Announcement,
  AnnouncementAction,
  AnnouncementFilters,
  EditorOutputData,
} from '@platon/feature/announcement/common'
import { UserRoles, User } from '@platon/core/common'

export class AnnouncementActionDTO implements AnnouncementAction {
  @IsString()
  @ApiProperty()
  label!: string

  @IsOptional()
  @IsUrl()
  @ApiProperty({ required: false })
  url?: string

  @IsOptional()
  @IsEnum(['primary', 'default', 'dashed', 'text', 'link'])
  @ApiProperty({ required: false, enum: ['primary', 'default', 'dashed', 'text', 'link'] })
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
}

export class AnnouncementDTO extends BaseDTO implements Announcement {
  @IsString()
  @ApiProperty()
  readonly title!: string

  @IsString()
  @ApiProperty()
  readonly description!: string

  @IsBoolean()
  @ApiProperty()
  readonly active!: boolean

  @IsOptional()
  @ApiProperty({ type: Object })
  readonly data?: EditorOutputData

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly icon?: string

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly version?: string

  @IsOptional()
  @IsDate()
  @ApiProperty()
  readonly displayUntil?: Date

  @IsOptional()
  @ApiProperty()
  readonly displayDurationInDays?: number

  @IsOptional()
  @IsArray()
  @IsEnum(UserRoles, { each: true })
  @ApiProperty({ enum: UserRoles })
  readonly targetedRoles?: UserRoles[]

  @IsOptional()
  @ApiProperty()
  @Type(() => UserDTO)
  readonly publisher?: User

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnnouncementActionDTO)
  @ApiProperty({ required: false, type: [AnnouncementActionDTO] })
  readonly actions?: AnnouncementAction[]

  @IsOptional()
  @IsDate()
  @ApiProperty({ required: false, description: 'When the person who asks read it, in the visible list only.' })
  readonly readAt?: Date
}

export class CreateAnnouncementDTO {
  @IsString()
  @ApiProperty()
  title!: string

  @IsString()
  @ApiProperty()
  description!: string

  @IsBoolean()
  @ApiProperty()
  active!: boolean

  @IsOptional()
  @ApiProperty({ type: Object })
  data?: EditorOutputData

  @IsOptional()
  @IsString()
  @ApiProperty()
  icon?: string

  @IsOptional()
  @IsDate()
  @ApiProperty()
  readonly displayUntil?: Date

  @IsOptional()
  @ApiProperty()
  readonly displayDurationInDays?: number

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly version?: string

  @IsOptional()
  @IsArray()
  @IsEnum(UserRoles, { each: true })
  @ApiProperty({ enum: UserRoles })
  readonly targetedRoles?: UserRoles[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnnouncementActionDTO)
  @ApiProperty({ required: false, type: [AnnouncementActionDTO] })
  readonly actions?: AnnouncementAction[]
}

export class UpdateAnnouncementDTO extends CreateAnnouncementDTO {}

export class AnnouncementFiltersDTO implements AnnouncementFilters {
  @IsString()
  @IsOptional()
  search?: string

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value
  })
  active?: boolean

  @IsOptional()
  @IsArray()
  @IsEnum(UserRoles, { each: true })
  @ApiProperty({ enum: UserRoles })
  roles?: UserRoles[]

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  offset?: number
}
