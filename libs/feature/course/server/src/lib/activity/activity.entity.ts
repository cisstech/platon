/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity } from '@platon/core/server';
import { ResourceEntity } from '@platon/feature/resource/server';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CourseEntity } from '../course.entity';
import { CourseSectionEntity } from '../section/section.entity';

@Entity('CourseActivities')
@Index('CourseActivities_section_idx', ['courseId', 'sectionId'])
export class CourseActivityEntity extends BaseEntity {
  @Column({ type: 'int' })
  order!: number

  @Index('CourseActivities_course_id_idx')
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

  @Column({ name: 'resource_id' })
  resourceId!: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource!: ResourceEntity

  @Column({ name: 'resource_version' })
  resourceVersion!: string
}
