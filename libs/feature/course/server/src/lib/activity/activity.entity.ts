import { BaseEntity, UserEntity } from '@platon/core/server';
import { PLSourceFile } from '@platon/feature/compiler';
import { ActivityPermissions, ActivityStates } from '@platon/feature/course/common';
import { Column, Entity, Index, JoinColumn, ManyToOne, VirtualColumn } from 'typeorm';
import { CourseEntity } from '../course.entity';
import { CourseSectionEntity } from '../section/section.entity';

@Entity('Activities')
export class ActivityEntity extends BaseEntity {
  @Index('Activities_creator_id_idx')
  @Column({ name: 'creator_id' })
  creatorId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator!: UserEntity

  @Index('Activities_course_id_idx')
  @Column({ name: 'course_id' })
  courseId!: string

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity

  @Index('Activities_section_id_idx')
  @Column({ name: 'section_id' })
  sectionId!: string

  @ManyToOne(() => CourseSectionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section!: CourseSectionEntity

  @Column({ type: 'jsonb', default: {} })
  source!: PLSourceFile

  @Index('Activities_open_at_idx')
  @Column({ name: 'open_at', nullable: true, type: 'timestamp with time zone' })
  openAt?: Date

  @Index('Activities_close_at_idx')
  @Column({ name: 'close_at', nullable: true, type: 'timestamp with time zone' })
  closeAt?: Date

  // VIRTUAL COLUMNS

  @VirtualColumn({ query: () => 'SELECT 0' })
  readonly progression!: number

  @VirtualColumn({ query: () => `source->'variables'->>'title'` })

  readonly title!: string;

  @VirtualColumn({ query: () => `SELECT 'opened'` })
  readonly state!: ActivityStates;

  @VirtualColumn({ query: () => `SELECT '{}'::jsonb` })
  readonly permissions!: ActivityPermissions;
}
