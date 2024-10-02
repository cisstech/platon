import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany } from 'typeorm'
import { PeerGameEntity } from './peerGame.entity'
import { ActivityEntity } from '@platon/feature/course/server'
import { SessionEntity } from '@platon/feature/result/server'
import { BaseEntity, UserEntity } from '@platon/core/server'
import { MatchStatus, PeerMatch } from '@platon/feature/peer/common'

@Entity('PeerMatch')
export class PeerMatchEntity extends BaseEntity implements PeerMatch {
  @Column({ name: 'activity_id', nullable: false })
  activityId!: string

  @ManyToOne(() => ActivityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity!: ActivityEntity

  @Column({ name: 'player1_id' })
  player1Id!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player1_id' })
  player1!: UserEntity

  @Column({ name: 'player1_session_id' })
  player1SessionId!: string

  @ManyToOne(() => SessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player1_session_id' })
  player1Session!: SessionEntity

  @Column({ name: 'player2_id' })
  player2Id!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player2_id' })
  player2!: UserEntity

  @Column({ name: 'player2_session_id' })
  player2SessionId!: string

  @ManyToOne(() => SessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player2_session_id' })
  player2Session!: SessionEntity

  @OneToMany(() => PeerGameEntity, (game) => game.match)
  @JoinTable()
  games!: PeerGameEntity[]

  @Column({ name: 'level', type: 'int', default: 0 })
  level!: number

  @Column({ name: 'status', type: 'enum', enum: MatchStatus, default: MatchStatus.Pending })
  status!: MatchStatus

  @Column({ name: 'winner_id', nullable: true })
  winnerId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'winner_id' })
  winner!: UserEntity

  @Column({ name: 'winner_session_id', nullable: true })
  winnerSessionId!: string

  @ManyToOne(() => SessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'winner_session_id' })
  winnerSession!: SessionEntity
}
