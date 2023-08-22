import { ViewColumn, ViewEntity } from 'typeorm'

/**
 * CourseMemberView represents a database view that selects distinct users from
 * courses, including those who are members of a user group.
 */
@ViewEntity({
  name: 'CourseMemberView',
  expression: `
    -- Select distinct users from courses, including those in user groups
    SELECT DISTINCT COALESCE(course_member.user_id, gp.user_id) as id,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      course_member.course_id,
      course.name as course_name,
      course_member.id as member_id
    FROM "CourseMembers" course_member
    -- INNER JOIN with Courses to get course details
    INNER JOIN "Courses" course ON course.id = course_member.course_id
    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships
    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id
    -- INNER JOIN with Users to get user details
    INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id
  `,
})
export class CourseMemberView {
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

  @ViewColumn({ name: 'member_id' })
  memberId!: string
}
