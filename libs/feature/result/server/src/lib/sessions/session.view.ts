import { ExerciseMeta } from '@platon/feature/compiler'
import { PlayerNavigation } from '@platon/feature/player/common'
import { ResourceTypes } from '@platon/feature/resource/common'
import { ViewColumn, ViewEntity } from 'typeorm'

/**
 * - This View is used to fetch session related data from various tables.
 * - The result is a comprehensive view of session data, including related resources, activities, courses, and more.
 */
@ViewEntity({
  name: 'SessionView',
  expression: `
  -- This query is used to fetch session related data from various tables.
  -- The result is a comprehensive view of session data, including related resources, activities, courses, and more.

  SELECT
      -- Fetching session related columns
      session.id,
      session.user_id,
      session.parent_id,
      session.grade,
      session.attempts,
      session.created_at,
      session.updated_at,
      session.last_graded_at,
      session.started_at,

      -- Fetching session source and variables related columns
      session.source->>'version' AS resource_version,
      session.variables->'.meta' AS exercise_meta,
      session.variables->'navigation' AS activity_navigation,

      -- Fetching resource related columns
      resource.id  AS resource_id,
      resource.type as resource_type,
      resource.name AS resource_name,
      resource.owner_id AS resource_owner_id,

      -- Fetching circle related columns
      circle.id AS circle_id,
      circle.name AS circle_name,

      -- Fetching correction related columns
      correction.id AS correction_id,
      correction.grade AS correction_grade,
      correction.author_id AS correction_author,
      CASE
        WHEN correctors.id IS NOT NULL THEN true
        ELSE false
      END AS correction_enabled,

      -- Fetching activity related columns
      activity.id AS activity_id,
      activity.open_at AS activity_open_at,
      activity.close_at AS activity_close_at,
      activity.creator_id AS activity_creator_id,
      activity.created_at AS activity_created_at,

      -- Fetching course related columns
      course.id AS course_id,
      course.name AS course_name,
      course.created_at AS course_created_at,
      course.owner_id AS course_owner_id,

      -- Fetching topics, levels, and answers related columns
      topics.matches AS topics,
      levels.matches AS levels,
      answers.matches AS answers

  FROM "Sessions" session

  -- Joining with Resources, Corrections, Activities, and Courses tables
  INNER JOIN "Resources" resource ON resource.id = CAST(session.source->>'resource' AS uuid)
  INNER JOIN "Resources" circle ON circle.id = resource.parent_id
  LEFT JOIN "Corrections" correction ON session.correction_id = correction.id
  LEFT JOIN "Activities" activity ON activity.id = session.activity_id
  LEFT JOIN "Courses" course ON course.id = activity.course_id

  -- Joining with subqueries to fetch aggregated answers, correctors, topics, and levels data
  LEFT JOIN (
      SELECT
        answer.session_id,
        jsonb_agg(
          jsonb_build_object(
            'grade', answer.grade,
            'createdAt', answer.created_at
          )
        ) AS matches
      FROM "Answers" answer
      GROUP BY answer.session_id
  ) answers ON answers.session_id = session.id

  LEFT JOIN (
    SELECT id, activity_id FROM "ActivityCorrectors" corrector LIMIT 1
  ) AS correctors ON correctors.id IS NOT NULL AND correctors.activity_id = session.activity_id

  LEFT JOIN (
    SELECT
      resource_id,
      json_agg(topic.name) AS matches
    FROM "ResourceTopics"
    INNER JOIN "Topics" topic ON topic.id = topic_id
    GROUP BY resource_id
  ) AS topics ON topics.resource_id = resource.id OR topics.resource_id = circle.id

  LEFT JOIN (
    SELECT
      resource_id,
      json_agg(level.name) AS matches
    FROM "ResourceLevels"
    INNER JOIN "Levels" level ON level.id = level_id
    GROUP BY resource_id
  ) AS levels ON levels.resource_id = resource.id OR levels.resource_id = circle.id
  `,
})
export class SessionView {
  // Session related properties

  /**
   * The id of the session.
   */
  @ViewColumn({ name: 'id' })
  id!: string

  /**
   * The id of the user associated with the session.
   */
  @ViewColumn({ name: 'user_id' })
  userId!: string

  /**
   * The id of the parent session associated with the session (if session is an exercise session).
   */
  @ViewColumn({ name: 'parent_id' })
  parentId?: string

  /**
   * The best of the session.
   */
  @ViewColumn({ name: 'grade' })
  grade!: number

  /**
   * The number of attempts made by the user for this session.
   */
  @ViewColumn({ name: 'attempts' })
  attempts!: number

  /**
   * The time when the session was created.
   */
  @ViewColumn({ name: 'created_at' })
  createdAt!: Date

  /**
   * The time when the session was updated.
   */
  @ViewColumn({ name: 'updated_at' })
  updatedAt!: Date

  /**
   * The time when the session was last graded.
   */
  @ViewColumn({ name: 'last_graded_at' })
  lastGradedAt?: Date

  /**
   * The time when the session was started.
   */
  @ViewColumn({ name: 'started_at' })
  startedAt?: Date

  // Session source and variables related properties

  /**
   * The meta of the exercise associated with the session (only if session is an exercise session)
   */
  @ViewColumn({ name: 'exercise_meta' })
  exerciseMeta?: ExerciseMeta

  /**
   * The navigation of the activity associated with the session (only if session is an activity session)
   */
  @ViewColumn({ name: 'activity_navigation' })
  activityNavigation?: PlayerNavigation

  // Resource related properties

  /**
   * The ID of the resource associated with the session.
   */
  @ViewColumn({ name: 'resource_id' })
  resourceId!: string

  /**
   * The type of the resource associated with the session.
   */
  @ViewColumn({ name: 'resource_type' })
  resourceType!: ResourceTypes

  /**
   * The name of the resource associated with the session.
   */
  @ViewColumn({ name: 'resource_name' })
  resourceName!: string

  /**
   * The ID of the user who owns the resource associated with the session.
   */
  @ViewColumn({ name: 'resource_owner_id' })
  resourceOwnerId!: string

  /**
   * The version of the resource associated with the session.
   */
  @ViewColumn({ name: 'resource_version' })
  resourceVersion!: string

  // Circle related properties

  /**
   * The ID of the circle associated with the session.
   */
  @ViewColumn({ name: 'circle_id' })
  circleId!: string

  /**
   * The name of the circle associated with the session.
   */
  @ViewColumn({ name: 'circle_name' })
  circleName!: string

  // Correction related properties

  /**
   * The id of the correction associated with the session (if any).
   */
  @ViewColumn({ name: 'correction_id' })
  correctionId?: string

  /**
   * The grade of the correction associated with the session.
   */
  @ViewColumn({ name: 'correction_grade' })
  correctionGrade?: number

  /**
   * The ID of the user who corrected this session (if any).
   */
  @ViewColumn({ name: 'correction_author' })
  correctionAuthor?: string

  /**
   * Whether the session is linked to an activity with correctors.
   */
  @ViewColumn({ name: 'correction_enabled' })
  correctionEnabled?: boolean

  // Activity related properties

  /**
   * The id of the activity associated with the session (if any).
   */
  @ViewColumn({ name: 'activity_id' })
  activityId?: string

  /**
   * The date when the activity associated with the session should be opened.
   */
  @ViewColumn({ name: 'activity_open_at' })
  activityOpenAt?: Date

  /**
   * The date when the activity associated with the session should be closed.
   */
  @ViewColumn({ name: 'activity_close_at' })
  activityCloseAt?: Date

  /**
   * The ID of the activity associated with the session.
   */
  @ViewColumn({ name: 'activity_creator_id' })
  activityCreatorId?: string

  /**
   * The date when the activity associated with the session was created.
   */
  @ViewColumn({ name: 'activity_created_at' })
  activityCreatedAt?: Date

  // Course related properties

  /**
   * The ID of the course associated with the session.
   */
  @ViewColumn({ name: 'course_id' })
  courseId?: string

  /**
   * The name of the course associated with the session.
   */
  @ViewColumn({ name: 'course_name' })
  courseName?: string

  /**
   * The date when the course associated with the session was created.
   */
  @ViewColumn({ name: 'course_created_at' })
  courseCreatedAt?: Date

  /**
   * The user ID of the owner of the course associated with the session.
   */
  @ViewColumn({ name: 'course_owner_id' })
  courseOwnerId?: string

  // Topics, levels, and answers related properties

  /**
   * List of topics associated with the session's resource or its parent circle.
   */
  @ViewColumn({ name: 'topics' })
  topics?: string[]

  /**
   * List of levels associated with the session's resource or its parent circle.
   */
  @ViewColumn({ name: 'levels' })
  levels?: string[]

  /**
   * List of all answers associated with the exercise session.
   */
  @ViewColumn({ name: 'answers' })
  answers?: {
    grade: number
    createdAt: Date
  }[]
}
