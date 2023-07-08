/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity } from '@platon/core/server';
import { ActivityEntity } from '@platon/feature/course/server';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CorrectionEntity } from '../correction/correction.entity';
import { PLSourceFile } from '@platon/feature/compiler';


@Entity('Sessions')
@Index('Sessions_exercise_idx', ['parentId', 'id'])
@Index('Sessions_activity_user_idx', ['parentId', 'activityId', 'userId'])
export class SessionEntity<TVariables extends object = any> extends BaseEntity {
  @Column({ name: 'parent_id', nullable: true })
  parentId?: string

  @ManyToOne(() => SessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent?: SessionEntity

  @Column({ type: 'uuid', nullable: true })
  envid?: string

  @Column({ name: 'user_id', nullable: true })
  userId?: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity

  @Column({ name: 'activity_id', nullable: true })
  activityId?: string

  @ManyToOne(() => ActivityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity?: ActivityEntity

  @Column({ name: 'correction_id', nullable: true })
  correctionId?: string

  @ManyToOne(() => CorrectionEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'correction_id' })
  correction?: CorrectionEntity

  @Column({ type: 'jsonb', default: {} })
  variables!: TVariables

  @Column({ type: 'float', default: -1 })
  grade!: number;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ type: 'timestamp with time zone', name: 'started_at', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp with time zone', name: 'last_graded_at', nullable: true })
  lastGradedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  source?: PLSourceFile
}

