import { Injectable } from '@nestjs/common'
import {
  activityDatesFor,
  calculateActivityOpenState,
  PlayableActivity,
  RestrictionList,
  TaughtActivity,
} from '@platon/feature/course/common'
import {
  audienceFlags,
  audienceOf,
  courseGroupsOf,
  IS_STUDENT,
  IS_TEACHER,
  membershipsOf,
} from '@platon/feature/course/server'
import { RecentCopy } from '@platon/feature/result/common'
import { DataSource } from 'typeorm'
import { toCorrect } from '../correction/correction.sql'
import {
  activityResource,
  activitySource,
  activityTitle,
  copyGrade,
  exerciseCount,
  exercisesDone,
  isRestricted,
  isTrue,
} from './home.sql'

const RECENT_COPIES = 3

/**
 * The activities a person plays: those open to them in the courses they study (not archived, not
 * entrance tests), with their own copy and what the restrictions need to know of them.
 */
const MINE = `
  WITH memberships AS (${membershipsOf('$1')}),
  held_groups AS (${courseGroupsOf('$1')}),
  studied AS (
    SELECT membership.course_id, array_agg(membership.member_id::text) AS member_ids
    FROM memberships membership
    INNER JOIN "Courses" studied_course ON studied_course.id = membership.course_id AND studied_course.is_test = FALSE
    GROUP BY membership.course_id
    HAVING ${IS_STUDENT} AND NOT bool_or(own AND archived)
  ),
  person AS (SELECT course_id, $1::uuid AS user_id FROM studied),
  flagged AS (${audienceFlags('activity.course_id IN (SELECT course_id FROM studied)')}),
  playable AS (${audienceOf('flagged', 'person')})
  SELECT
    activity.id,
    course.id AS "courseId",
    course.name AS "courseName",
    ${activityTitle('resource')} AS title,
    activity.open_at AS "openAt",
    activity.close_at AS "closeAt",
    activity.ignore_restrictions AS "ignoreRestrictions",
    activity.restrictions,
    activity.is_challenge AS "isChallenge",
    activity.graded,
    activity_source.variables->'settings'->'duration' AS duration,
    activity_source.variables->'settings'->'actions'->'retry' AS retry,
    ${exerciseCount('own_copy.navigation')} AS "exerciseCount",
    ${exercisesDone('own_copy.navigation')} AS "exercisesDone",
    own_copy.started_at IS NOT NULL AS started,
    ${isTrue("own_copy.navigation->'terminated'")} AS terminated,
    studied.member_ids AS "memberIds",
    ARRAY(SELECT group_id::text FROM held_groups WHERE held_groups.course_id = course.id) AS "groupIds"
  FROM playable
  INNER JOIN "Activities" activity ON activity.id = playable.activity_id
  INNER JOIN studied ON studied.course_id = activity.course_id
  INNER JOIN "Courses" course ON course.id = activity.course_id
  ${activitySource('activity')}
  ${activityResource('resource')}
  LEFT JOIN LATERAL (
    SELECT copy.started_at, copy.variables->'navigation' AS navigation
    FROM "Sessions" copy
    WHERE copy.activity_id = activity.id AND copy.user_id = $1 AND copy.parent_id IS NULL
    ORDER BY copy.created_at DESC
    LIMIT 1
  ) own_copy ON TRUE
  ORDER BY course.name, activity."order", activity.created_at
`

/**
 * The activities of the courses a person teaches and has not archived, all of them, as the list of
 * their courses shows those courses, with the students they are open to,
 * those who started them and the mean of their copies, aggregated per student then per activity.
 * For an activity with restriction periods, its students come back one by one, for the periods to
 * say who can play it.
 */
const TAUGHT = `
  WITH memberships AS (${membershipsOf('$1')}),
  taught AS (
    SELECT course_id FROM memberships GROUP BY course_id HAVING ${IS_TEACHER} AND NOT bool_or(own AND archived)
  ),
  course_people AS (
    SELECT
      member_row.course_id,
      COALESCE(member_row.user_id, group_user.user_id) AS user_id,
      member_row.id AS member_id,
      member_row.role
    FROM "CourseMembers" member_row
    LEFT JOIN "UserGroupsUsers" group_user
      ON member_row.user_id IS NULL AND group_user.group_id = member_row.group_id
    WHERE member_row.course_id IN (SELECT course_id FROM taught)
  ),
  students AS (
    SELECT course_id, user_id, array_agg(member_id::text) AS member_ids
    FROM course_people
    WHERE user_id IS NOT NULL
    GROUP BY course_id, user_id
    HAVING ${IS_STUDENT}
  ),
  flagged AS (${audienceFlags('activity.course_id IN (SELECT course_id FROM taught)')}),
  audience AS (${audienceOf('flagged', 'students')}),
  progress AS (
    SELECT
      audience.activity_id,
      audience.user_id,
      COUNT(copy.id) > 0 AS started,
      AVG(${copyGrade('copy')}) AS grade
    FROM audience
    LEFT JOIN "Sessions" copy
      ON copy.activity_id = audience.activity_id
      AND copy.user_id = audience.user_id
      AND copy.parent_id IS NULL
      AND copy.started_at IS NOT NULL
    GROUP BY audience.activity_id, audience.user_id
  )
  SELECT
    activity.id,
    course.id AS "courseId",
    course.name AS "courseName",
    ${activityTitle('resource')} AS title,
    activity.open_at AS "openAt",
    activity.close_at AS "closeAt",
    ${isRestricted('activity')} AS restricted,
    activity.is_challenge AS "isChallenge",
    activity.graded,
    COALESCE(summary.students, 0) AS "studentCount",
    COALESCE(summary.started, 0) AS "startedCount",
    summary.average AS "averageGrade",
    CASE WHEN ${isRestricted('activity')} THEN activity.restrictions END AS restrictions,
    CASE WHEN ${isRestricted('activity')} THEN (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'userId', player.user_id,
        'memberIds', student.member_ids,
        'groupIds', ARRAY(
          SELECT held.group_id::text FROM (${courseGroupsOf('player.user_id')}) held
          WHERE held.course_id = activity.course_id
        ),
        'started', player.started,
        'grade', player.grade
      )), '[]'::jsonb)
      FROM progress player
      INNER JOIN students student ON student.course_id = activity.course_id AND student.user_id = player.user_id
      WHERE player.activity_id = activity.id
    ) END AS audience
  FROM taught
  INNER JOIN "Courses" course ON course.id = taught.course_id
  INNER JOIN "Activities" activity ON activity.course_id = course.id
  ${activitySource('activity')}
  ${activityResource('resource')}
  LEFT JOIN (
    SELECT
      activity_id,
      COUNT(*)::int AS students,
      (COUNT(*) FILTER (WHERE started))::int AS started,
      ROUND((AVG(grade) FILTER (WHERE started))::numeric, 2)::float AS average
    FROM progress
    GROUP BY activity_id
  ) summary ON summary.activity_id = activity.id
  ORDER BY course.name, activity."order", activity.created_at
`

/**
 * The last copies a person terminated and had started, the most recent first, with what they may
 * know of their grade: nothing when the activity hides the correction, else whether an exercise
 * still waits for one of its correctors, else the grade.
 */
const RECENT = `
  WITH recent AS (
    SELECT copy.id, copy.activity_id, copy.terminated_at
    FROM "Sessions" copy
    WHERE copy.user_id = $1
      AND copy.parent_id IS NULL
      AND copy.terminated_at IS NOT NULL
      AND copy.started_at IS NOT NULL
    ORDER BY copy.terminated_at DESC
    LIMIT ${RECENT_COPIES}
  )
  SELECT
    copy.id AS "sessionId",
    activity.id AS "activityId",
    ${activityTitle('resource')} AS "activityTitle",
    course.id AS "courseId",
    course.name AS "courseName",
    copy.terminated_at AS "terminatedAt",
    ${isTrue("activity_source.variables->'settings'->'feedback'->'review'")} AS review,
    (
      EXISTS (SELECT 1 FROM "ActivityCorrectors" corrector WHERE corrector.activity_id = activity.id)
      AND EXISTS (
        SELECT 1 FROM "Sessions" exercise_session
        WHERE exercise_session.parent_id = copy.id
          AND exercise_session.correction_id IS NULL
          AND ${toCorrect('exercise_session')}
      )
    ) AS correcting,
    ${copyGrade('copy')} AS grade
  FROM recent copy
  INNER JOIN "Activities" activity ON activity.id = copy.activity_id
  INNER JOIN "Courses" course ON course.id = activity.course_id
  ${activitySource('activity')}
  ${activityResource('resource')}
  ORDER BY copy.terminated_at DESC
`

interface MineRow extends Omit<PlayableActivity, 'state' | 'duration' | 'attempts'> {
  ignoreRestrictions: boolean | null
  restrictions: RestrictionList[] | null
  duration: unknown
  retry: unknown
  memberIds: string[]
  groupIds: string[]
}

interface Player {
  userId: string
  memberIds: string[]
  groupIds: string[]
  started: boolean
  grade: number | null
}

interface TaughtRow extends Omit<TaughtActivity, 'state' | 'averageGrade'> {
  averageGrade: number | null
  restrictions: RestrictionList[] | null
  audience: Player[] | null
}

interface RecentRow extends Omit<RecentCopy, 'status' | 'grade'> {
  review: boolean
  correcting: boolean
  grade: number | null
}

/** A limit of the settings, where zero or less means unlimited. */
const limit = (value: unknown): number | undefined => (typeof value === 'number' && value > 0 ? value : undefined)

const mean = (values: number[]): number | undefined =>
  values.length ? Math.round((100 * values.reduce((sum, value) => sum + value, 0)) / values.length) / 100 : undefined

/**
 * Who of an activity's audience its restriction periods let play, with how many started it and the
 * mean of their copies.
 */
const countPlayers = (restrictions: RestrictionList[] | null, audience: Player[]) => {
  const players = audience.filter(({ userId, memberIds, groupIds }) =>
    activityDatesFor(
      { ignoreRestrictions: false, restrictions },
      { userId, memberIds: new Set(memberIds), groupIds: new Set(groupIds) }
    )
  )
  const started = players.filter((player) => player.started)
  return {
    studentCount: players.length,
    startedCount: started.length,
    averageGrade: mean(started.flatMap((player) => (player.grade == null ? [] : [player.grade]))),
  }
}

/** What the homes show of a person's activities and copies, each in one query. */
@Injectable()
export class HomeService {
  constructor(private readonly dataSource: DataSource) {}

  async playableActivities(userId: string): Promise<PlayableActivity[]> {
    const rows: MineRow[] = await this.dataSource.query(MINE, [userId])
    return rows.flatMap((row) => {
      const subject = { userId, memberIds: new Set(row.memberIds), groupIds: new Set(row.groupIds) }
      const dates = activityDatesFor(row, subject)
      if (!dates) return []
      return [
        {
          id: row.id,
          courseId: row.courseId,
          courseName: row.courseName,
          title: row.title,
          openAt: dates.openAt ?? null,
          closeAt: dates.closeAt ?? null,
          state: calculateActivityOpenState(dates),
          isChallenge: row.isChallenge,
          graded: row.graded,
          duration: limit(row.duration),
          attempts: limit(row.retry),
          exerciseCount: row.exerciseCount,
          exercisesDone: row.exercisesDone,
          started: row.started,
          terminated: row.terminated,
        },
      ]
    })
  }

  async taughtActivities(userId: string): Promise<TaughtActivity[]> {
    const rows: TaughtRow[] = await this.dataSource.query(TAUGHT, [userId])
    return rows.map(({ restrictions, audience, averageGrade, ...row }) => ({
      ...row,
      state: calculateActivityOpenState(row),
      averageGrade: averageGrade ?? undefined,
      ...(audience ? countPlayers(restrictions, audience) : {}),
    }))
  }

  async recentCopies(userId: string): Promise<RecentCopy[]> {
    const rows: RecentRow[] = await this.dataSource.query(RECENT, [userId])
    return rows.map(({ review, correcting, grade, ...copy }) => {
      if (!review) return { ...copy, status: 'hidden' }
      if (correcting) return { ...copy, status: 'correcting' }
      return { ...copy, status: 'graded', grade: grade ?? 0 }
    })
  }
}
