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
      course_member.course_id::uuid,
      activity_corrector.activity_id::uuid
    FROM "ActivityCorrectors" activity_corrector
    INNER JOIN "CourseMembers" course_member ON course_member.id = activity_corrector.member_id
    LEFT JOIN "UserGroupsUsers" gp ON activity_corrector.user_id IS NULL AND gp.group_id = course_member.group_id
    INNER JOIN "Users" u ON u.id=activity_corrector.user_id OR u.id = course_member.user_id OR u.id = gp.user_id
  `,
})
export class ActivityCorrectorView {
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

  @ViewColumn({ name: 'activity_id' })
  activityId!: string
}
