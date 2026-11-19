/**
 * The activities `where` selects, with what decides who they are open to: `id`, `course_id`,
 * `creator_id`, `has_members` (it names members) and `has_group_members` (one of its groups holds
 * someone). Read once per activity, whatever the number of people.
 */
export const audienceFlags = (where: string) => `
  SELECT
    activity.id,
    activity.course_id,
    activity.creator_id,
    EXISTS (SELECT 1 FROM "ActivityMembers" any_member WHERE any_member.activity_id = activity.id) AS has_members,
    EXISTS (
      SELECT 1 FROM "ActivityGroup" any_group
      INNER JOIN "CourseGroups" flagged_group ON flagged_group.id = any_group.group_id
      INNER JOIN "CourseGroupsMember" flagged_member ON flagged_member.group_id = flagged_group.group_id
      WHERE any_group.activity_id = activity.id
    ) AS has_group_members
  FROM "Activities" activity
  WHERE ${where}`

/**
 * Who, among `people` (`course_id`, `user_id`), the activities of `activities` (built by
 * `audienceFlags`) are open to, as the course page lists them: the whole course when an activity
 * names neither members nor group members, else its creator, the people its members name and those
 * its groups hold. One row per activity and person.
 */
export const audienceOf = (activities: string, people: string) => `
  SELECT activity.id AS activity_id, person.user_id
  FROM ${activities} activity
  INNER JOIN ${people} person ON person.course_id = activity.course_id
  WHERE (NOT activity.has_members AND NOT activity.has_group_members) OR person.user_id = activity.creator_id
  UNION
  SELECT activity.id, person.user_id
  FROM ${activities} activity
  INNER JOIN "ActivityMembers" activity_member ON activity_member.activity_id = activity.id
  INNER JOIN "CourseMembers" named ON named.id = activity_member.member_id
  LEFT JOIN "UserGroupsUsers" named_group_user
    ON activity_member.user_id IS NULL AND named.user_id IS NULL AND named_group_user.group_id = named.group_id
  INNER JOIN ${people} person
    ON person.course_id = activity.course_id
    AND person.user_id = COALESCE(activity_member.user_id, named.user_id, named_group_user.user_id)
  UNION
  SELECT activity.id, person.user_id
  FROM ${activities} activity
  INNER JOIN "ActivityGroup" activity_group ON activity_group.activity_id = activity.id
  INNER JOIN "CourseGroups" course_group ON course_group.id = activity_group.group_id
  INNER JOIN "CourseGroupsMember" group_member ON group_member.group_id = course_group.group_id
  INNER JOIN ${people} person ON person.course_id = activity.course_id AND person.user_id = group_member.user_id`
