/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity } from '@platon/core/server'
import { SessionComment } from '@platon/feature/result/common'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { AnswerEntity } from '../answers/answer.entity'
import { SessionEntity } from '../sessions/session.entity'

@Entity('SessionComments')
@Index('SessionComments_session_id_answer_id_idx', ['sessionId', 'answerId'])
export class SessionCommentEntity extends BaseEntity implements SessionComment {
  @Column({ name: 'author_id' })
  authorId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity

  @Index('SessionComments_session_id_idx')
  @Column({ name: 'session_id' })
  sessionId!: string

  @ManyToOne(() => SessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: SessionEntity

  @Index('SessionComments_answer_id_idx')
  @Column({ name: 'answer_id' })
  answerId!: string

  @ManyToOne(() => AnswerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answer!: AnswerEntity

  @Column({ type: 'text' })
  comment!: string
}
