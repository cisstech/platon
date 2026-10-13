import { BaseEntity, UserEntity } from '@platon/core/server'
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { AnnouncementEntity } from './announcement.entity'

/** A person has read an announcement: opened it, or closed its banner. `createdAt` says when. */
@Entity('AnnouncementReads')
@Unique('AnnouncementReads_unique_idx', ['userId', 'announcementId'])
export class AnnouncementReadEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity

  // Deleting an announcement deletes its reads: the unique index starts with the person.
  @Index('AnnouncementReads_announcement_id_idx')
  @Column({ name: 'announcement_id' })
  announcementId!: string

  @ManyToOne(() => AnnouncementEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'announcement_id' })
  announcement!: AnnouncementEntity
}
