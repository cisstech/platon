/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity } from '@platon/core/server'
import { ActivityVariables, ExerciseVariables, PLSourceFile } from '@platon/feature/compiler'
import { ActivityEntity } from '@platon/feature/course/server'
import { Session } from '@platon/feature/result/common'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { CorrectionEntity } from '../correction/correction.entity'

@Entity('Sessions')
@Index('Sessions_exercise_idx', ['parentId', 'id'])
@Index('Sessions_activity_user_idx', ['parentId', 'activityId', 'userId'])
export class SessionEntity<TVariables = any> extends BaseEntity implements Session<TVariables> {
  @Column({ name: 'parent_id', nullable: true })
  parentId?: string | null

  @ManyToOne(() => SessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent?: SessionEntity<ActivityVariables> | null

  @Column({ type: 'uuid', nullable: true })
  envid?: string | null

  @Column({ name: 'user_id', nullable: true })
  userId?: string | null

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity | null

  @Column({ name: 'activity_id', nullable: true })
  activityId?: string | null

  @ManyToOne(() => ActivityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity?: ActivityEntity | null

  @Column({ name: 'correction_id', nullable: true })
  correctionId?: string | null

  @ManyToOne(() => CorrectionEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'correction_id' })
  correction?: CorrectionEntity | null

  @Column({ type: 'jsonb', default: {} })
  variables!: TVariables

  @Column({ type: 'float', default: -1 })
  grade!: number

  @Column({ type: 'int', default: 0 })
  attempts!: number

  @Column({ type: 'timestamp with time zone', name: 'started_at', nullable: true })
  startedAt?: Date | null

  @Column({ type: 'timestamp with time zone', name: 'succeeded_at', nullable: true })
  succeededAt?: Date | null

  @Column({ type: 'timestamp with time zone', name: 'last_graded_at', nullable: true })
  lastGradedAt?: Date | null

  @Column({ type: 'jsonb' })
  source!: PLSourceFile<TVariables>

  @Column({ name: 'is_built', default: false })
  isBuilt!: boolean
}

export type ExerciseSessionEntity = SessionEntity<ExerciseVariables>
export type ActivitySessionEntity = SessionEntity<ActivityVariables>
