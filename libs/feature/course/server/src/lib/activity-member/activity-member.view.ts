import { ViewEntity, ViewColumn } from 'typeorm'

/**
 * ActivityMemberView represents a database view that combines activity users
 * and course users. This view is built using two Common Table Expressions (CTEs)
 * - activity_users: Selects users who are specifically linked to an activity
 * - fallback_course_users: Selects users who are linked to a course, used as a fallback
 *
 * The view combines the results of both CTEs using a UNION ALL statement, prioritizing
 * the activity users and falling back to the course users if there are no activity users.
 */
@ViewEntity({
  name: 'ActivityMemberView',
  expression: `
  -- Define a Common Table Expression (CTE) to select activity users
  WITH activity_users AS (
    SELECT
      DISTINCT ON (u.id)
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      course_member.course_id,
      course.name as course_name,
      activity_member.activity_id,
    activity.source->'variables'->>'title' as activity_name,
    activity_member.id as member_id
    FROM "CourseMembers" course_member

    -- INNER JOIN with Courses to get course details
    INNER JOIN "Courses" course ON course.id = course_member.course_id
    -- INNER JOIN with Activities to get activity details
    INNER JOIN "Activities" activity ON activity.course_id = course_member.course_id

    -- LEFT JOIN with ActivityMembers to get activity-specific memberships
    LEFT JOIN "ActivityMembers" activity_member ON course_member.id=activity_member.member_id
    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships
    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id=course_member.group_id
    -- INNER JOIN with Users to get user details
    INNER JOIN "Users" u ON u.id=activity_member.user_id OR u.id=course_member.user_id OR (activity_member.user_id IS NULL AND u.id=gp.user_id)

    -- Filter for rows with a specific activity_id
    WHERE activity_member.activity_id IS NOT NULL
  ),
  -- Define another CTE to select course users as a fallback
  fallback_course_users AS (
    SELECT
      DISTINCT ON (u.id, activity.id)
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      course_member.course_id,
      course.name as course_name,
      activity.id,
    activity.source->'variables'->>'title' as activity_name,
    NULL::uuid as member_id
    FROM "CourseMembers" course_member

    -- INNER JOIN with Courses to get course details
    INNER JOIN "Courses" course ON course.id = course_member.course_id
    -- INNER JOIN with Activities to get activity details
    INNER JOIN "Activities" activity ON activity.course_id = course_member.course_id

    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships
    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id
    -- INNER JOIN with Users to get user details
    INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id

	WHERE (
		SELECT id FROM "ActivityMembers" activity_member WHERE activity_member.activity_id = activity.id LIMIT 1
	) IS NULL
    -- ORDER BY to resolve which activity_id should be selected when there are multiple
    ORDER BY u.id, activity.id
  )
  -- Select all rows from the 'activity_users' CTE
  (SELECT * FROM activity_users au
  -- Combine the results from 'activity_users' with the results from 'fallback_course_users'
  UNION ALL
  -- Select rows from the 'fallback_course_users' CTE only if there are no rows in 'activity_users'
  SELECT * FROM fallback_course_users
  )
  `,
})
export class ActivityMemberView {
  /**
   * Member's user identifier
   */
  @ViewColumn()
  id!: string

  @ViewColumn()
  username!: string

  @ViewColumn({ name: 'first_name' })
  firstName!: string

  @ViewColumn({ name: 'last_name' })
  lastName!: string

  @ViewColumn()
  email!: string

  @ViewColumn({ name: 'course_id' })
  courseId!: string

  @ViewColumn({ name: 'course_name' })
  courseName!: string

  @ViewColumn({ name: 'activity_id' })
  activityId!: string

  @ViewColumn({ name: 'activity_name' })
  activityName!: string

  /**
   * Member's activity member identifier (if exists)
   */
  @ViewColumn({ name: 'member_id' })
  memberId?: string
}
