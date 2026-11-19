import { CourseMemberRoles } from '@platon/feature/course/common'

/**
 * The `CourseMembers` rows that hold a person, their own and those of their user groups: `course_id`,
 * `member_id`, `role`, `archived`, and `own` for their own row. Starts from the person, so that it
 * reads their rows only.
 */
export const membershipsOf = (user: string) => `
  SELECT own_row.course_id, own_row.id AS member_id, own_row.role, own_row.archived, TRUE AS own
  FROM "CourseMembers" own_row
  WHERE own_row.user_id = ${user}
  UNION ALL
  SELECT group_row.course_id, group_row.id, group_row.role, group_row.archived, FALSE
  FROM "UserGroupsUsers" group_user
  INNER JOIN "CourseMembers" group_row ON group_row.group_id = group_user.group_id
  WHERE group_user.user_id = ${user}`

/** The course groups that hold a person: `course_id`, and `group_id` for `CourseGroups.id`. */
export const courseGroupsOf = (user: string) => `
  SELECT course_group.course_id, course_group.id AS group_id
  FROM "CourseGroupsMember" group_member
  INNER JOIN "CourseGroups" course_group ON course_group.group_id = group_member.group_id
  WHERE group_member.user_id = ${user}`

/**
 * Over the member rows of one person in one course, grouped: whether they are a student of it, that
 * is a student who does not also teach it.
 */
export const IS_STUDENT = `bool_or(role = '${CourseMemberRoles.student}') AND NOT bool_or(role = '${CourseMemberRoles.teacher}')`

/** Over the member rows of one person in one course, grouped: whether they teach it. */
export const IS_TEACHER = `bool_or(role = '${CourseMemberRoles.teacher}')`
