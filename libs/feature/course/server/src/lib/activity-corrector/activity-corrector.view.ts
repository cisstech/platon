import { ViewEntity, ViewColumn } from 'typeorm'

/**
 * ActivityCorrectorView represents a database view that selects distinct corrector users from
 * activities, including those who are members of a user group.
 */
@ViewEntity({
  name: 'ActivityCorrectorView',
  expression: `
  SELECT DISTINCT COALESCE(activity_corrector.user_id, course_member.user_id, gp.user_id) as id,
    u.username,
    u.first_name,
    u.last_name,
    u.email,
    course_member.course_id,
    course.name as course_name,
    activity_corrector.activity_id,
    activity.source->'variables'->>'title' as activity_name,
    activity_corrector.id as corrector_id
  FROM "ActivityCorrectors" activity_corrector
  INNER JOIN "CourseMembers" course_member ON course_member.id = activity_corrector.member_id
	INNER JOIN "Courses" course ON course.id = course_member.course_id
  INNER JOIN "Activities" activity ON activity.id = activity_corrector.activity_id
	LEFT JOIN "UserGroupsUsers" gp ON activity_corrector.user_id IS NULL AND gp.group_id = course_member.group_id
	INNER JOIN "Users" u ON u.id=activity_corrector.user_id OR u.id = course_member.user_id OR u.id = gp.user_id
  `,
})
export class ActivityCorrectorView {
  /**
   * Corrector's user identifier
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

  @ViewColumn({ name: 'corrector_id' })
  correctorId!: string
}
