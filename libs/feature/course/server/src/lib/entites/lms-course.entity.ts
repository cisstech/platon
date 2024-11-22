import { BaseEntity } from '@platon/core/server'
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { LmsEntity } from '@platon/feature/lti/server'
import { CourseEntity } from './course.entity'

@Entity('LmsCourses')
@Unique('LmsCourses_unique_idx', ['lmsId', 'lmsCourseId', 'courseId'])
export class LmsCourseEntity extends BaseEntity {
  @Column({ name: 'lms_course_id' })
  lmsCourseId!: string

  @Column({ name: 'lms_id' })
  lmsId!: string

  @ManyToOne(() => LmsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lms_id' })
  lms!: LmsEntity

  @Column({ name: 'course_id' })
  courseId!: string

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity
}
