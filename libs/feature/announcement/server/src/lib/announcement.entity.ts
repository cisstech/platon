import { UserRoles } from '@platon/core/common'
import { BaseEntity, UserEntity } from '@platon/core/server'
import { Announcement, AnnouncementAction, EditorOutputData } from '@platon/feature/announcement/common'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { Column, ManyToOne, Entity } from 'typeorm'

@Entity('Announcements')
export class AnnouncementEntity extends BaseEntity implements Announcement {
  @Column({ name: 'title' })
  @IsString()
  title!: string

  @Column()
  @IsString()
  description!: string

  @Column({ default: true })
  @IsBoolean()
  active!: boolean

  @Column({ type: 'jsonb', nullable: true })
  data?: EditorOutputData

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  version?: string

  @Column({ name: 'display_until', type: 'timestamp with time zone', nullable: true })
  displayUntil?: Date

  @Column({ name: 'display_duration_in_days', type: 'int', nullable: true })
  displayDurationInDays?: number

  @Column({ type: 'enum', enum: UserRoles, array: true, nullable: true })
  @IsOptional()
  targetedRoles?: UserRoles[]

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  publisher?: UserEntity

  @Column({ type: 'jsonb', nullable: true })
  actions?: AnnouncementAction[]

  /** When the person who asks read it, set on the visible announcements; not a column. */
  readAt?: Date
}
