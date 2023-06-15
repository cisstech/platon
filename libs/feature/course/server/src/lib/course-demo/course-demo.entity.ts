import { BaseEntity } from '@platon/core/server';
import { Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { CourseEntity } from '../course.entity';

@Entity('CourseDemos')
export class CourseDemoEntity extends BaseEntity {
  @OneToOne((type) => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;
}
