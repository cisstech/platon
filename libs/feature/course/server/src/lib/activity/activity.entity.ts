import { BaseEntity, UserEntity } from '@platon/core/server'
import { ActivityVariables, PLSourceFile } from '@platon/feature/compiler'
import { Activity, ActivityOpenStates, ActivityPermissions } from '@platon/feature/course/common'
import { Column, Entity, Index, JoinColumn, ManyToOne, VirtualColumn } from 'typeorm'
import { CourseEntity } from '../entites/course.entity'
import { CourseSectionEntity } from '../section/section.entity'

@Entity('Activities')
export class ActivityEntity extends BaseEntity implements Activity {
  @Index('Activities_creator_id_idx')
  @Column({ name: 'creator_id', default: '00000000-0000-0000-0000-000000000000' })
  creatorId!: string

  // @ts-expect-error: SET DEFAULT does not exist in OnDeleteType
  @ManyToOne(() => UserEntity, { onDelete: 'SET DEFAULT' })
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
  source!: PLSourceFile<ActivityVariables>

  @Index('Activities_open_at_idx')
  @Column({ name: 'open_at', nullable: true, type: 'timestamp with time zone' })
  openAt?: Date | null

  @Index('Activities_close_at_idx')
  @Column({ name: 'close_at', nullable: true, type: 'timestamp with time zone' })
  closeAt?: Date | null

  @Index('Activities_is_challenge_idx')
  @Column({ name: 'is_challenge', default: false })
  isChallenge!: boolean

  @Column({ default: 0 })
  order!: number

  // VIRTUAL COLUMNS
  // TODO: use expanders instead of virtual columns

  @VirtualColumn({ query: () => `SELECT ''` })
  readonly title!: string

  @VirtualColumn({ query: () => `SELECT ''` })
  readonly resourceId!: string

  @VirtualColumn({ query: () => `SELECT 0::integer` })
  readonly exerciseCount!: number

  @VirtualColumn({ query: () => `SELECT 'opened'` })
  readonly state!: ActivityOpenStates

  @VirtualColumn({ query: () => 'SELECT 0::integer' })
  readonly timeSpent!: number

  @VirtualColumn({ query: () => 'SELECT 0::integer' })
  readonly progression!: number

  @VirtualColumn({ query: () => `SELECT '{}'::jsonb` })
  readonly permissions!: ActivityPermissions

  @VirtualColumn({
    query: (alias) => `SELECT (${alias}.source->'variables'->'settings'->'navigation'->>'mode' = 'peer')::boolean`,
  })
  readonly isPeerComparison!: boolean
}
