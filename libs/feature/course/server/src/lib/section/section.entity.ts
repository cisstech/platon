/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity } from '@platon/core/server'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { CourseEntity } from '../entites/course.entity'

@Entity('CourseSections')
export class CourseSectionEntity extends BaseEntity {
  @Column()
  name!: string

  @Column({ type: 'int' })
  order!: number

  @Column({ nullable: true })
  desc?: string

  @Index('CourseSections_course_id_idx')
  @Column({ name: 'course_id' })
  courseId!: string

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity
}
