import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { BaseEntity } from '@platon/core/server'
import { CourseEntity } from '../entites/course.entity'

@Entity('CourseGroups')
@Unique('Unique_CourseGroup', ['groupId', 'courseId'])
export class CourseGroupEntity extends BaseEntity {
  @Index('CourseGroups_name_idx', { synchronize: false })
  @Column({ name: 'group_id' })
  groupId!: string

  @Index('CourseGroups_course_id_idx')
  @Column({ name: 'course_id' })
  courseId!: string

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity

  @Column({ name: 'name' })
  name!: string
}
