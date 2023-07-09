import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCourseMemberViews1681047107903 implements MigrationInterface {
  name = 'AddCourseMemberViews1681047107903'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE VIEW "ActivityCorrectorView" AS
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
  `)
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'ActivityCorrectorView',
        'SELECT DISTINCT COALESCE(activity_corrector.user_id, course_member.user_id, gp.user_id) as id,\n      u.username,\n      u.first_name,\n      u.last_name,\n      u.email,\n      course_member.course_id::uuid,\n      activity_corrector.activity_id::uuid\n    FROM "ActivityCorrectors" activity_corrector\n    INNER JOIN "CourseMembers" course_member ON course_member.id = activity_corrector.member_id\n    LEFT JOIN "UserGroupsUsers" gp ON activity_corrector.user_id IS NULL AND gp.group_id = course_member.group_id\n    INNER JOIN "Users" u ON u.id=activity_corrector.user_id OR u.id = course_member.user_id OR u.id = gp.user_id',
      ]
    )
    await queryRunner.query(`CREATE VIEW "CourseMemberView" AS
    -- Select distinct users from courses, including those in user groups
    SELECT DISTINCT COALESCE(course_member.user_id, gp.user_id) as id,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      course_member.course_id::uuid
    FROM "CourseMembers" course_member
    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships
    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id
    -- INNER JOIN with Users to get user details
    INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id
  `)
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'CourseMemberView',
        '-- Select distinct users from courses, including those in user groups\n    SELECT DISTINCT COALESCE(course_member.user_id, gp.user_id) as id,\n      u.username,\n      u.first_name,\n      u.last_name,\n      u.email,\n      course_member.course_id::uuid\n    FROM "CourseMembers" course_member\n    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships\n    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id\n    -- INNER JOIN with Users to get user details\n    INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id',
      ]
    )
    await queryRunner.query(`CREATE VIEW "ActivityMemberView" AS
  -- Define a Common Table Expression (CTE) to select activity users
  WITH activity_users AS (
    SELECT
      u.id::uuid,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      course_member.course_id::uuid,
      activity_member.activity_id::uuid
    FROM "CourseMembers" course_member
    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships
    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id
    -- INNER JOIN with Users to get user details
    INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id
    -- LEFT JOIN with ActivityMembers to get activity-specific memberships
    LEFT JOIN "ActivityMembers" activity_member ON course_member.id = activity_member.member_id
    -- Filter for rows with a specific activity_id
    WHERE activity_member.activity_id IS NOT NULL
  ),
  -- Define another CTE to select course users as a fallback
  fallback_course_users AS (
    SELECT
      u.id::uuid,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      course_member.course_id::uuid,
      NULL::uuid
    FROM "CourseMembers" course_member
    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships
    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id
    -- INNER JOIN with Users to get user details
    INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id
  )
  -- Select all rows from the 'activity_users' CTE
  SELECT * FROM activity_users
  -- Combine the results from 'activity_users' with the results from 'fallback_course_users'
  UNION ALL
  -- Select rows from the 'fallback_course_users' CTE only if there are no rows in 'activity_users'
  SELECT * FROM fallback_course_users
  WHERE NOT EXISTS (SELECT 1 FROM activity_users);
  `)
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'ActivityMemberView',
        '-- Define a Common Table Expression (CTE) to select activity users\n  WITH activity_users AS (\n    SELECT\n      u.id::uuid,\n      u.username,\n      u.first_name,\n      u.last_name,\n      u.email,\n      course_member.course_id::uuid,\n      activity_member.activity_id::uuid\n    FROM "CourseMembers" course_member\n    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships\n    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id\n    -- INNER JOIN with Users to get user details\n    INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id\n    -- LEFT JOIN with ActivityMembers to get activity-specific memberships\n    LEFT JOIN "ActivityMembers" activity_member ON course_member.id = activity_member.member_id\n    -- Filter for rows with a specific activity_id\n    WHERE activity_member.activity_id IS NOT NULL\n  ),\n  -- Define another CTE to select course users as a fallback\n  fallback_course_users AS (\n    SELECT\n      u.id::uuid,\n      u.username,\n      u.first_name,\n      u.last_name,\n      u.email,\n      course_member.course_id::uuid,\n      NULL::uuid\n    FROM "CourseMembers" course_member\n    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships\n    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id\n    -- INNER JOIN with Users to get user details\n    INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id\n  )\n  -- Select all rows from the \'activity_users\' CTE\n  SELECT * FROM activity_users\n  -- Combine the results from \'activity_users\' with the results from \'fallback_course_users\'\n  UNION ALL\n  -- Select rows from the \'fallback_course_users\' CTE only if there are no rows in \'activity_users\'\n  SELECT * FROM fallback_course_users\n  WHERE NOT EXISTS (SELECT 1 FROM activity_users);',
      ]
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'ActivityMemberView', 'public']
    )
    await queryRunner.query(`DROP VIEW "ActivityMemberView"`)
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'CourseMemberView', 'public']
    )
    await queryRunner.query(`DROP VIEW "CourseMemberView"`)
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'ActivityCorrectorView', 'public']
    )
    await queryRunner.query(`DROP VIEW "ActivityCorrectorView"`)
  }
}
