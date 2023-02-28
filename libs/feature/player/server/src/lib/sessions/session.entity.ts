/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity } from '@platon/core/server';
import { CourseActivityEntity } from '@platon/feature/course/server';
import { ResourceEntity } from '@platon/feature/resource/server';
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';


@Entity('PlayerSessions')
@Index('PlayerSessions_exercise_idx', ['parentId', 'id'])
@Unique('PlayerSessions_activity_idx', ['courseActivityId', 'userId'])
export class PlayerSessionEntity extends BaseEntity {
  @Column({ name: 'parent_id', nullable: true })
  parentId?: string

  @ManyToOne(() => PlayerSessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent?: PlayerSessionEntity

  @Column({ type: 'uuid', nullable: true })
  envid?: string

  @Column({ name: 'user_id', nullable: true })
  userId?: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity

  @Column({ name: 'resource_id', nullable: true })
  resourceId?: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource?: ResourceEntity

  @Column({ name: 'course_activity_id', nullable: true })
  courseActivityId?: string

  @ManyToOne(() => CourseActivityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_activity_id' })
  courseActivity?: CourseActivityEntity


  @Column({ type: 'jsonb', default: {} })
  variables!: Record<string, any>

  @Column({ type: 'timestamp with time zone', name: 'started_at', nullable: true })
  startedAt?: Date;
}

