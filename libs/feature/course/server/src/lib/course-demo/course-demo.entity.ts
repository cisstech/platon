import { BaseEntity } from '@platon/core/server'
import { Entity, JoinColumn, OneToOne } from 'typeorm'
import { CourseEntity } from '../entites/course.entity'

@Entity('CourseDemos')
export class CourseDemoEntity extends BaseEntity {
  @OneToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity
}
