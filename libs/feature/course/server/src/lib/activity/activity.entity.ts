import { BaseEntity } from '@platon/core/server';
import { PLSourceFile } from '@platon/feature/compiler';
import { ActivityStates } from '@platon/feature/course/common';
import { Column, Entity, Index, JoinColumn, ManyToOne, VirtualColumn } from 'typeorm';
import { CourseEntity } from '../course.entity';
import { CourseSectionEntity } from '../section/section.entity';

@Entity('Activities')
@Index('Activities_section_idx', ['courseId', 'sectionId'])
export class ActivityEntity extends BaseEntity {
  @Index('Activities_course_id_idx')
  @Column({ name: 'course_id' })
  courseId!: string

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity

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

  @VirtualColumn({ query: () => 'SELECT 0' })
  progression!: number

  @VirtualColumn({ query: () => `source->'variables'->>'title'` })

  readonly title!: string;

  @VirtualColumn({ query: () => `SELECT 'opened'` })
  readonly state!: ActivityStates;
}
