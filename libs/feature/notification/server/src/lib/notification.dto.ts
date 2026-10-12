import { ApiProperty } from '@nestjs/swagger'
import { MAX_PAGE_SIZE, MIN_PAGE_OFFSET, MIN_PAGE_SIZE } from '@platon/core/common'
import { BaseDTO, ToBoolean, ToInt } from '@platon/core/server'
import { Notification, NotificationFilters } from '@platon/feature/notification/common'
import { IsBoolean, IsDate, IsInt, IsObject, IsOptional, IsUUID, Max, Min } from 'class-validator'

export class NotificationDTO extends BaseDTO implements Notification {
  @IsUUID()
  @ApiProperty()
  readonly userId!: string

  @IsDate()
  @IsOptional()
  @ApiProperty({ nullable: true, required: false })
  readonly readAt?: Date | null

  /** What the notification says, with what the screens need to act on it (an invitation still pending...). */
  @IsObject()
  @ApiProperty()
  readonly data!: Record<string, unknown>
}

export class NotificationFiltersDTO implements NotificationFilters {
  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  readonly unread?: boolean

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  readonly excludeSignals?: boolean

  @ToInt()
  @IsInt()
  @IsOptional()
  @Min(MIN_PAGE_OFFSET)
  readonly offset?: number

  @ToInt()
  @IsInt()
  @IsOptional()
  @Min(MIN_PAGE_SIZE)
  @Max(MAX_PAGE_SIZE)
  readonly limit?: number
}
