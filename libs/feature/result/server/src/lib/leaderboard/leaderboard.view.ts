import { UserEntity } from '@platon/core/server'
import { JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm'

// This view may be turned into a materialized view to improve performance if needed.

/**
 * Represents a view entity that ranks sessions by grade and duration.
 * @remarks
 * - The ranking is based on the grade and duration of the session.
 * - Only sessions with a positive grade and a last_graded_at date are considered.
 * - Sessions that are not bound to an activity or user are ignored.
 * - To rank a specific activity, resource, or course, use the respective IDs while querying the view with a WHERE clause.
 */
@ViewEntity({
  name: 'LeaderboardView',
  expression: `
    -- Subquery to rank sessions by grade and and duration
    WITH RankedSessions AS (
      SELECT
        session.id,
        activity.course_id,
        session.user_id,
        session.parent_id,
        session.activity_id,
        COALESCE(correction.grade, session.grade) as grade,
        session.started_at,
        session.last_graded_at,
        session.source->>'resource' as resource_id,
        ROW_NUMBER() OVER (
          ORDER BY
          COALESCE(correction.grade, session.grade) DESC,
          session.last_graded_at - session.started_at ASC
        ) AS rank
      FROM "Sessions" session
      INNER JOIN "Activities" activity ON activity.id = session.activity_id
      LEFT JOIN "Corrections" correction ON correction.id = session.correction_id
      WHERE
        session.activity_id IS NOT NULL
        AND session.last_graded_at IS NOT NULL
        AND session.user_id IS NOT NULL
        AND (session.grade IS NOT NULL AND session.grade > 0)
    )

    -- Main query to order sessions by rank
    SELECT
      id,
      user_id,
      course_id,
      parent_id,
      activity_id,
      resource_id,
      grade,
      started_at,
      last_graded_at
    FROM RankedSessions session
    ORDER BY rank
  `,
})
export class LeaderboardView {
  @PrimaryColumn()
  @ViewColumn()
  id!: string

  @ViewColumn({ name: 'user_id' })
  userId!: string

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity

  @ViewColumn({ name: 'course_id' })
  courseId!: string

  @ViewColumn({ name: 'activity_id' })
  activityId!: string

  @ViewColumn({ name: 'resource_id' })
  resourceId!: string

  @ViewColumn({ name: 'parent_id' })
  parentId?: string | null

  @ViewColumn()
  grade!: number

  @ViewColumn({ name: 'started_at' })
  startedAt!: Date

  @ViewColumn({ name: 'last_graded_at' })
  lastGradedAt!: Date
}
