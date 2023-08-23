import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixDistinctCourseMemberView1692777613787 implements MigrationInterface {
  name = 'FixDistinctCourseMemberView1692777613787'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, [
      'VIEW',
      'CourseMemberView',
      'public',
    ])
    await queryRunner.query(`DROP VIEW "CourseMemberView"`)
    await queryRunner.query(`CREATE VIEW "CourseMemberView" AS
    -- Select distinct users from courses, including those in user groups
    SELECT
      DISTINCT ON(u.id, course.id)
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      u.role,
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
  `)
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'CourseMemberView',
        '-- Select distinct users from courses, including those in user groups\n    SELECT\n      DISTINCT ON(u.id, course.id)\n      u.id,\n      u.username,\n      u.first_name,\n      u.last_name,\n      u.email,\n      u.role,\n      course_member.course_id,\n      course.name as course_name,\n      course_member.id as member_id\n    FROM "CourseMembers" course_member\n    -- INNER JOIN with Courses to get course details\n    INNER JOIN "Courses" course ON course.id = course_member.course_id\n    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships\n    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id\n    -- INNER JOIN with Users to get user details\n    INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id',
      ]
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, [
      'VIEW',
      'CourseMemberView',
      'public',
    ])
    await queryRunner.query(`DROP VIEW "CourseMemberView"`)
    await queryRunner.query(`CREATE VIEW "CourseMemberView" AS -- Select distinct users from courses, including those in user groups
    SELECT
      DISTINCT ON(u.id)
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      u.role,
      course_member.course_id,
      course.name as course_name,
      course_member.id as member_id
    FROM "CourseMembers" course_member
    -- INNER JOIN with Courses to get course details
    INNER JOIN "Courses" course ON course.id = course_member.course_id
    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships
    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id
    -- INNER JOIN with Users to get user details
    INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id`)
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'CourseMemberView',
        '-- Select distinct users from courses, including those in user groups\n    SELECT\n      DISTINCT ON(u.id)\n      u.id,\n      u.username,\n      u.first_name,\n      u.last_name,\n      u.email,\n      u.role,\n      course_member.course_id,\n      course.name as course_name,\n      course_member.id as member_id\n    FROM "CourseMembers" course_member\n    -- INNER JOIN with Courses to get course details\n    INNER JOIN "Courses" course ON course.id = course_member.course_id\n    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships\n    LEFT JOIN "UserGroupsUsers" gp ON gp.group_id = course_member.group_id\n    -- INNER JOIN with Users to get user details\n    INNER JOIN "Users" u ON u.id = course_member.user_id OR u.id = gp.user_id',
      ]
    )
  }
}
