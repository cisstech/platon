import { BaseEntity } from '@platon/core/server'
import { Column, Entity, Index} from 'typeorm'

@Entity('WatchedChallenges')
export class WatchedChallengesEntity extends BaseEntity {
  @Index('Challenge_idx', { synchronize: false })
  @Column()
  challengeId!: string

  @Index('Channel_idx')
  @Column({ name: 'channel_id' })
  channelId!: string
}