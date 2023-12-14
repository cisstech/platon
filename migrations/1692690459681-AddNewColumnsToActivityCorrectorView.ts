import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNewColumnsToActivityCorrectorView1692690459681 implements MigrationInterface {
  name = 'AddNewColumnsToActivityCorrectorView1692690459681'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, [
      'VIEW',
      'ActivityCorrectorView',
      'public',
    ])
    await queryRunner.query(`DROP VIEW "ActivityCorrectorView"`)
    await queryRunner.query(`CREATE VIEW "ActivityCorrectorView" AS
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
  `)
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'ActivityCorrectorView',
        'SELECT DISTINCT COALESCE(activity_corrector.user_id, course_member.user_id, gp.user_id) as id,\n    u.username,\n    u.first_name,\n    u.last_name,\n    u.email,\n    course_member.course_id,\n    course.name as course_name,\n    activity_corrector.activity_id,\n    activity.source->\'variables\'->>\'title\' as activity_name,\n    activity_corrector.id as corrector_id\n  FROM "ActivityCorrectors" activity_corrector\n  INNER JOIN "CourseMembers" course_member ON course_member.id = activity_corrector.member_id\n\tINNER JOIN "Courses" course ON course.id = course_member.course_id\n  INNER JOIN "Activities" activity ON activity.id = activity_corrector.activity_id\n\tLEFT JOIN "UserGroupsUsers" gp ON activity_corrector.user_id IS NULL AND gp.group_id = course_member.group_id\n\tINNER JOIN "Users" u ON u.id=activity_corrector.user_id OR u.id = course_member.user_id OR u.id = gp.user_id',
      ]
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, [
      'VIEW',
      'ActivityCorrectorView',
      'public',
    ])
    await queryRunner.query(`DROP VIEW "ActivityCorrectorView"`)
    await queryRunner.query(`CREATE VIEW "ActivityCorrectorView" AS SELECT DISTINCT COALESCE(activity_corrector.user_id, course_member.user_id, gp.user_id) as id,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      course_member.course_id::uuid,
      activity_corrector.activity_id::uuid
    FROM "ActivityCorrectors" activity_corrector
    INNER JOIN "CourseMembers" course_member ON course_member.id = activity_corrector.member_id
    LEFT JOIN "UserGroupsUsers" gp ON activity_corrector.user_id IS NULL AND gp.group_id = course_member.group_id
    INNER JOIN "Users" u ON u.id=activity_corrector.user_id OR u.id = course_member.user_id OR u.id = gp.user_id`)
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'ActivityCorrectorView',
        'SELECT DISTINCT COALESCE(activity_corrector.user_id, course_member.user_id, gp.user_id) as id,\n      u.username,\n      u.first_name,\n      u.last_name,\n      u.email,\n      course_member.course_id::uuid,\n      activity_corrector.activity_id::uuid\n    FROM "ActivityCorrectors" activity_corrector\n    INNER JOIN "CourseMembers" course_member ON course_member.id = activity_corrector.member_id\n    LEFT JOIN "UserGroupsUsers" gp ON activity_corrector.user_id IS NULL AND gp.group_id = course_member.group_id\n    INNER JOIN "Users" u ON u.id=activity_corrector.user_id OR u.id = course_member.user_id OR u.id = gp.user_id',
      ]
    )
  }
}
