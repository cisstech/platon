import { BaseEntity, UserEntity } from '@platon/core/server'
import { PeerGame } from '@platon/feature/peer/common'

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { PeerMatchEntity } from './peerMatch.entity'

@Entity('PeerGame')
export class PeerGameEntity extends BaseEntity implements PeerGame {
  @Column({ name: 'match_id', nullable: false })
  matchId!: string

  @ManyToOne(() => PeerMatchEntity, (match) => match.games, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id' })
  match!: PeerMatchEntity

  @Column({ name: 'winner_id', nullable: true })
  winnerId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'winner_id' })
  winner!: UserEntity

  @Column({ name: 'corrector_id' })
  correctorId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'corrector_id' })
  corrector!: UserEntity
}
