/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity } from '@platon/core/server';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { PlayerSessionEntity } from '../sessions/session.entity';


@Entity('PlayerAnswers')
@Index('PlayerAnswers_user_id_session_id_idx', ['userId', 'sessionId'])
export class PlayerAnswerEntity extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  userId?: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity

  @Column({ name: 'session_id' })
  sessionId!: string

  @ManyToOne(() => PlayerSessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: PlayerSessionEntity

  @Column({ type: 'jsonb' })
  variables!: Record<string, any>

  @Column({ type: 'int', default: -1 })
  grade!: number
}

