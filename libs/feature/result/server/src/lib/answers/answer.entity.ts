/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity } from '@platon/core/server'
import { ExerciseVariables } from '@platon/feature/compiler'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { SessionEntity } from '../sessions/session.entity'

@Entity('Answers')
@Index('Answers_user_id_session_id_idx', ['userId', 'sessionId'])
export class AnswerEntity extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  userId?: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity

  @Index('Answers_session_id_idx')
  @Column({ name: 'session_id' })
  sessionId!: string

  @ManyToOne(() => SessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: SessionEntity

  @Column({ type: 'jsonb' })
  variables!: ExerciseVariables

  @Column({ type: 'float', default: -1 })
  grade!: number
}
