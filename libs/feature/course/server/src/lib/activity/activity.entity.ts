import { BaseEntity } from '@platon/core/server';
import { PLSourceFile } from '@platon/feature/compiler';
import { CourseActivityStates } from '@platon/feature/course/common';
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, VirtualColumn } from 'typeorm';
import { CourseEntity } from '../course.entity';
import { CourseMemberEntity } from '../member/member.entity';
import { CourseSectionEntity } from '../section/section.entity';

@Entity('CourseActivities')
@Index('CourseActivities_section_idx', ['courseId', 'sectionId'])
export class CourseActivityEntity extends BaseEntity {
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

  @Column({ type: 'jsonb', default: {} })
  source!: PLSourceFile

  @Index('CourseActivities_open_at_idx')
  @Column({ name: 'open_at', nullable: true, type: 'timestamp with time zone' })
  openAt?: Date

  @Index('CourseActivities_close_at_idx')
  @Column({ name: 'close_at', nullable: true, type: 'timestamp with time zone' })
  closeAt?: Date

  @ManyToMany(() => CourseMemberEntity)
  @JoinTable({
    name: 'CourseActivityMembers',
    joinColumn: {
      name: 'activity_id',
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "member_id",
      referencedColumnName: "id"
    }
  })
  members!: CourseMemberEntity[]

  @VirtualColumn({ query: () => 'SELECT 0' })
  progression!: number

  @VirtualColumn({ query: () => `source->'variables'->>'title'` })

  readonly title!: string;

  @VirtualColumn({ query: () => `SELECT 'opened'` })
  readonly state!: CourseActivityStates;

}
