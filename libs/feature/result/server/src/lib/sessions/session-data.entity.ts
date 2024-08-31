import { UserEntity } from '@platon/core/server'
import { ExerciseMeta } from '@platon/feature/compiler'
import { PlayerNavigation } from '@platon/feature/player/common'
import { ResourceTypes } from '@platon/feature/resource/common'
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

/**
 * - This Table is used to fetch session related data from various tables.
 * - The result is a comprehensive table of session data, including related resources, activities, courses, and more.
 */
@Entity('SessionData')
@Index('SessionData_user_idx', ['userId'])
@Index('SessionData_resource_idx', ['resourceId'])
export class SessionDataEntity {
  @PrimaryGeneratedColumn('uuid')
  tid!: string

  @Column({ name: 'id', type: 'uuid' })
  id!: string

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string

  @Column({ name: 'grade', type: 'double precision' })
  grade!: number

  @Column({ name: 'attempts', type: 'int' })
  attempts!: number

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date

  @Column({ name: 'last_graded_at', type: 'timestamp', nullable: true })
  lastGradedAt?: Date

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date

  @Column({ name: 'exercise_meta', type: 'jsonb', nullable: true })
  exerciseMeta?: ExerciseMeta

  @Column({ name: 'activity_navigation', type: 'jsonb', nullable: true })
  activityNavigation?: PlayerNavigation

  @Column({ name: 'resource_id', type: 'uuid' })
  resourceId!: string

  @Column({ name: 'resource_type', type: 'varchar' })
  resourceType!: ResourceTypes

  @Column({ name: 'resource_name', type: 'varchar' })
  resourceName!: string

  @Column({ name: 'resource_owner_id', type: 'uuid' })
  resourceOwnerId!: string

  @Column({ name: 'resource_version', type: 'varchar' })
  resourceVersion!: string

  @Column({ name: 'circle_id', type: 'uuid' })
  circleId!: string

  @Column({ name: 'circle_name', type: 'varchar' })
  circleName!: string

  @Column({ name: 'correction_id', type: 'uuid', nullable: true })
  correctionId?: string

  @Column({ name: 'correction_grade', type: 'double precision', nullable: true })
  correctionGrade?: number

  @Column({ name: 'correction_author', type: 'uuid', nullable: true })
  correctionAuthor?: string

  @Column({ name: 'correction_enabled', type: 'boolean', nullable: true })
  correctionEnabled?: boolean

  @Column({ name: 'activity_id', type: 'uuid', nullable: true })
  activityId?: string

  @Column({ name: 'activity_open_at', type: 'timestamp', nullable: true })
  activityOpenAt?: Date

  @Column({ name: 'activity_close_at', type: 'timestamp', nullable: true })
  activityCloseAt?: Date

  @Column({ name: 'activity_creator_id', type: 'uuid', nullable: true })
  activityCreatorId?: string

  @Column({ name: 'activity_created_at', type: 'timestamp', nullable: true })
  activityCreatedAt?: Date

  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId?: string

  @Column({ name: 'course_name', type: 'varchar', nullable: true })
  courseName?: string

  @Column({ name: 'course_created_at', type: 'timestamp', nullable: true })
  courseCreatedAt?: Date

  @Column({ name: 'course_owner_id', type: 'uuid', nullable: true })
  courseOwnerId?: string

  @Column({ name: 'topics', type: 'jsonb', nullable: true })
  topics?: string[]

  @Column({ name: 'levels', type: 'jsonb', nullable: true })
  levels?: string[]

  @Column({ name: 'answers', type: 'jsonb', nullable: true })
  answers?: {
    grade: number
    createdAt: string
  }[]
}
