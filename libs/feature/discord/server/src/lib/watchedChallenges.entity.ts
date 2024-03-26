/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity } from '@platon/core/server'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('WatchedChallenges')
export class WatchedChallengesEntity extends BaseEntity {
  @Index('Challenge_idx', { synchronize: false })
  @Column()
  challengeId!: string

  @Index('Channel_idx')
  @Column({ name: 'channel_id' })
  channelId!: string
}