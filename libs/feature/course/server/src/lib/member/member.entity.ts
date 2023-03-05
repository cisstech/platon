/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity, UserGroupEntity } from '@platon/core/server';
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CourseEntity } from '../course.entity';

@Entity('CourseMembers')
@Unique('CourseMembers_unique_user_idx', ['courseId', 'userId'])
@Unique('CourseMembers_unique_group_idx', ['courseId', 'groupId'])
export class CourseMemberEntity extends BaseEntity {
  @Index('CourseMembers_course_id_idx')
  @Column({ name: 'course_id' })
  courseId!: string

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity

  @Column({ name: 'user_id', nullable: true })
  userId?: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity

  @Index('CourseMembers_group_id_idx')
  @Column({ name: 'group_id', nullable: true })
  groupId?: string

  @ManyToOne(() => UserGroupEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id', })
  group?: UserGroupEntity
}
