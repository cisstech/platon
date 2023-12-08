import { BaseEntity, UserEntity } from '@platon/core/server'
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { LmsEntity } from './lms.entity'

@Entity('LmsUsers')
@Unique('LmsUsers_unique_idx', ['lmsId', 'lmsUserId', 'userId'])
export class LmsUserEntity extends BaseEntity {
  @Column({ name: 'lms_user_id' })
  lmsUserId!: string

  @Column({ name: 'lms_id' })
  lmsId!: string

  @ManyToOne(() => LmsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lms_id' })
  lms!: LmsEntity

  @Column({ name: 'user_id' })
  userId!: string

  @Column({ name: 'username' })
  username!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity
}
