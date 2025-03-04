import { UserEntity } from '@platon/core/server'
import { JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm'

// This view may be turned into a materialized view to improve performance if needed.

/**
 * Represents a view entity that ranks sessions by grade and duration.
 * @remarks
 * - The ranking is based on the grade and duration of the session.
 * - Only sessions with `succeeded_at` date are considered.
 * - Sessions that are not bound to an activity or user are ignored.
 * - To rank a specific activity, resource, or course, use the respective IDs while querying the view with a WHERE clause.
 */
@ViewEntity({
  name: 'LeaderboardView',
  materialized: true,
  expression: `
  WITH RankedSessions AS (
    SELECT
      session.id,
      session.user_id,
      session.activity_id,
      COALESCE(correction.grade, session.grade) as grade,
      session.started_at,
      session.succeeded_at,
      session.last_graded_at,
      ROW_NUMBER() OVER (
        ORDER BY
          COALESCE(correction.grade, session.grade) DESC,
          session.succeeded_at ASC,
          session.last_graded_at - session.started_at ASC
      ) AS session_rank
    FROM "Sessions" session
    LEFT JOIN "Corrections" correction ON correction.id = session.correction_id
    WHERE
      session.activity_id IS NOT NULL
      AND session.user_id IS NOT NULL
      AND session.parent_id IS NULL
      AND session.succeeded_at IS NOT NULL
  )
  SELECT
    id,
    user_id,
    activity_id,
    grade,
    started_at,
    succeeded_at,
    last_graded_at
  FROM RankedSessions
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

  @ViewColumn({ name: 'activity_id' })
  activityId!: string

  @ViewColumn()
  grade!: number

  @ViewColumn({ name: 'started_at' })
  startedAt!: Date

  @ViewColumn({ name: 'succeeded_at' })
  succeededAt!: Date

  @ViewColumn({ name: 'last_graded_at' })
  lastGradedAt!: Date
}
