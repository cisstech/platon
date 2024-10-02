import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPeerComparisonTables1727276979899 implements MigrationInterface {
    name = 'AddPeerComparisonTables1727276979899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","ActivityMemberView","public"]);
        await queryRunner.query(`DROP VIEW "ActivityMemberView"`);
        await queryRunner.query(`CREATE TYPE "public"."PeerMatch_status_enum" AS ENUM('pending', 'running', 'next', 'done')`);
        await queryRunner.query(`CREATE TABLE "PeerMatch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "activity_id" uuid NOT NULL, "player1_id" uuid NOT NULL, "player1_session_id" uuid NOT NULL, "player2_id" uuid NOT NULL, "player2_session_id" uuid NOT NULL, "level" integer NOT NULL DEFAULT '0', "status" "public"."PeerMatch_status_enum" NOT NULL DEFAULT 'pending', "winner_id" uuid, "winner_session_id" uuid, CONSTRAINT "PK_e1e3b977e68b9fa21a2b57caee5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bf74d50a9b38cfaedd192613ad" ON "PeerMatch" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_93dfa9bec724a31335c978276e" ON "PeerMatch" ("updated_at") `);
        await queryRunner.query(`CREATE TABLE "PeerGame" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "match_id" uuid NOT NULL, "winner_id" uuid, "corrector_id" uuid NOT NULL, CONSTRAINT "PK_28af2d368418e3fdae8ed52020f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_44124ceb409972dc4ef05b9504" ON "PeerGame" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_707c79da95ef4c6525b8be4b7f" ON "PeerGame" ("updated_at") `);
        await queryRunner.query(`ALTER TABLE "PeerMatch" ADD CONSTRAINT "FK_739bda238b7c9519c13d04f6c81" FOREIGN KEY ("activity_id") REFERENCES "Activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" ADD CONSTRAINT "FK_a2e0b37dc4936c4230a94c78cec" FOREIGN KEY ("player1_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" ADD CONSTRAINT "FK_f81efc54e5ad94067c0a2ad2b61" FOREIGN KEY ("player1_session_id") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" ADD CONSTRAINT "FK_ec47af28d00ea730503daaf9527" FOREIGN KEY ("player2_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" ADD CONSTRAINT "FK_af749e8c22521ad077afbfdc0d8" FOREIGN KEY ("player2_session_id") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" ADD CONSTRAINT "FK_aff0f075d5b1a53f6a0cc6aa143" FOREIGN KEY ("winner_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" ADD CONSTRAINT "FK_b328c75c6a6fee3fa9e05381de2" FOREIGN KEY ("winner_session_id") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PeerGame" ADD CONSTRAINT "FK_06a1b4d994421efbe5a4910a2c8" FOREIGN KEY ("match_id") REFERENCES "PeerMatch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PeerGame" ADD CONSTRAINT "FK_53a067e4f1d78ae9bbf860fa964" FOREIGN KEY ("winner_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PeerGame" ADD CONSTRAINT "FK_bb9b179a6e48f0e378d7c6e3128" FOREIGN KEY ("corrector_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE VIEW "ActivityMemberView" AS 
  -- Define a Common Table Expression (CTE) to select activity users
  WITH activity_users AS (
    SELECT
      DISTINCT ON (member_id)
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      u.role,
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
      u.role,
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
  `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","ActivityMemberView","-- Define a Common Table Expression (CTE) to select activity users\n  WITH activity_users AS (\n    SELECT\n      DISTINCT ON (member_id)\n      u.id,\n      u.username,\n      u.first_name,\n      u.last_name,\n      u.email,\n      u.role,\n      course_member.course_id,\n      course.name as course_name,\n      activity_member.activity_id,\n    activity.source->'variables'->>'title' as activity_name,\n    activity_member.id as member_id\n    FROM \"CourseMembers\" course_member\n\n    -- INNER JOIN with Courses to get course details\n    INNER JOIN \"Courses\" course ON course.id = course_member.course_id\n    -- INNER JOIN with Activities to get activity details\n    INNER JOIN \"Activities\" activity ON activity.course_id = course_member.course_id\n\n    -- LEFT JOIN with ActivityMembers to get activity-specific memberships\n    LEFT JOIN \"ActivityMembers\" activity_member ON course_member.id=activity_member.member_id\n    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships\n    LEFT JOIN \"UserGroupsUsers\" gp ON gp.group_id=course_member.group_id\n    -- INNER JOIN with Users to get user details\n    INNER JOIN \"Users\" u ON u.id=activity_member.user_id OR u.id=course_member.user_id OR (activity_member.user_id IS NULL AND u.id=gp.user_id)\n\n    -- Filter for rows with a specific activity_id\n    WHERE activity_member.activity_id IS NOT NULL\n  ),\n  -- Define another CTE to select course users as a fallback\n  fallback_course_users AS (\n    SELECT\n      DISTINCT ON (u.id, activity.id)\n      u.id,\n      u.username,\n      u.first_name,\n      u.last_name,\n      u.email,\n      u.role,\n      course_member.course_id,\n      course.name as course_name,\n      activity.id,\n    activity.source->'variables'->>'title' as activity_name,\n    NULL::uuid as member_id\n    FROM \"CourseMembers\" course_member\n\n    -- INNER JOIN with Courses to get course details\n    INNER JOIN \"Courses\" course ON course.id = course_member.course_id\n    -- INNER JOIN with Activities to get activity details\n    INNER JOIN \"Activities\" activity ON activity.course_id = course_member.course_id\n\n    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships\n    LEFT JOIN \"UserGroupsUsers\" gp ON gp.group_id = course_member.group_id\n    -- INNER JOIN with Users to get user details\n    INNER JOIN \"Users\" u ON u.id = course_member.user_id OR u.id = gp.user_id\n\n\tWHERE (\n\t\tSELECT id FROM \"ActivityMembers\" activity_member WHERE activity_member.activity_id = activity.id LIMIT 1\n\t) IS NULL\n    -- ORDER BY to resolve which activity_id should be selected when there are multiple\n    ORDER BY u.id, activity.id\n  )\n  -- Select all rows from the 'activity_users' CTE\n  (SELECT * FROM activity_users au\n  -- Combine the results from 'activity_users' with the results from 'fallback_course_users'\n  UNION ALL\n  -- Select rows from the 'fallback_course_users' CTE only if there are no rows in 'activity_users'\n  SELECT * FROM fallback_course_users\n  )"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","ActivityMemberView","public"]);
        await queryRunner.query(`DROP VIEW "ActivityMemberView"`);
        await queryRunner.query(`ALTER TABLE "PeerGame" DROP CONSTRAINT "FK_bb9b179a6e48f0e378d7c6e3128"`);
        await queryRunner.query(`ALTER TABLE "PeerGame" DROP CONSTRAINT "FK_53a067e4f1d78ae9bbf860fa964"`);
        await queryRunner.query(`ALTER TABLE "PeerGame" DROP CONSTRAINT "FK_06a1b4d994421efbe5a4910a2c8"`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" DROP CONSTRAINT "FK_b328c75c6a6fee3fa9e05381de2"`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" DROP CONSTRAINT "FK_aff0f075d5b1a53f6a0cc6aa143"`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" DROP CONSTRAINT "FK_af749e8c22521ad077afbfdc0d8"`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" DROP CONSTRAINT "FK_ec47af28d00ea730503daaf9527"`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" DROP CONSTRAINT "FK_f81efc54e5ad94067c0a2ad2b61"`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" DROP CONSTRAINT "FK_a2e0b37dc4936c4230a94c78cec"`);
        await queryRunner.query(`ALTER TABLE "PeerMatch" DROP CONSTRAINT "FK_739bda238b7c9519c13d04f6c81"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_707c79da95ef4c6525b8be4b7f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_44124ceb409972dc4ef05b9504"`);
        await queryRunner.query(`DROP TABLE "PeerGame"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_93dfa9bec724a31335c978276e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bf74d50a9b38cfaedd192613ad"`);
        await queryRunner.query(`DROP TABLE "PeerMatch"`);
        await queryRunner.query(`DROP TYPE "public"."PeerMatch_status_enum"`);
        await queryRunner.query(`CREATE VIEW "ActivityMemberView" AS -- Define a Common Table Expression (CTE) to select activity users
  WITH activity_users AS (
    SELECT
      DISTINCT ON (u.id)
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      u.role,
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
      u.role,
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
  )`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","ActivityMemberView","-- Define a Common Table Expression (CTE) to select activity users\n  WITH activity_users AS (\n    SELECT\n      DISTINCT ON (u.id)\n      u.id,\n      u.username,\n      u.first_name,\n      u.last_name,\n      u.email,\n      u.role,\n      course_member.course_id,\n      course.name as course_name,\n      activity_member.activity_id,\n    activity.source->'variables'->>'title' as activity_name,\n    activity_member.id as member_id\n    FROM \"CourseMembers\" course_member\n\n    -- INNER JOIN with Courses to get course details\n    INNER JOIN \"Courses\" course ON course.id = course_member.course_id\n    -- INNER JOIN with Activities to get activity details\n    INNER JOIN \"Activities\" activity ON activity.course_id = course_member.course_id\n\n    -- LEFT JOIN with ActivityMembers to get activity-specific memberships\n    LEFT JOIN \"ActivityMembers\" activity_member ON course_member.id=activity_member.member_id\n    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships\n    LEFT JOIN \"UserGroupsUsers\" gp ON gp.group_id=course_member.group_id\n    -- INNER JOIN with Users to get user details\n    INNER JOIN \"Users\" u ON u.id=activity_member.user_id OR u.id=course_member.user_id OR (activity_member.user_id IS NULL AND u.id=gp.user_id)\n\n    -- Filter for rows with a specific activity_id\n    WHERE activity_member.activity_id IS NOT NULL\n  ),\n  -- Define another CTE to select course users as a fallback\n  fallback_course_users AS (\n    SELECT\n      DISTINCT ON (u.id, activity.id)\n      u.id,\n      u.username,\n      u.first_name,\n      u.last_name,\n      u.email,\n      u.role,\n      course_member.course_id,\n      course.name as course_name,\n      activity.id,\n    activity.source->'variables'->>'title' as activity_name,\n    NULL::uuid as member_id\n    FROM \"CourseMembers\" course_member\n\n    -- INNER JOIN with Courses to get course details\n    INNER JOIN \"Courses\" course ON course.id = course_member.course_id\n    -- INNER JOIN with Activities to get activity details\n    INNER JOIN \"Activities\" activity ON activity.course_id = course_member.course_id\n\n    -- LEFT JOIN with UserGroupsUsers to account for group-based memberships\n    LEFT JOIN \"UserGroupsUsers\" gp ON gp.group_id = course_member.group_id\n    -- INNER JOIN with Users to get user details\n    INNER JOIN \"Users\" u ON u.id = course_member.user_id OR u.id = gp.user_id\n\n\tWHERE (\n\t\tSELECT id FROM \"ActivityMembers\" activity_member WHERE activity_member.activity_id = activity.id LIMIT 1\n\t) IS NULL\n    -- ORDER BY to resolve which activity_id should be selected when there are multiple\n    ORDER BY u.id, activity.id\n  )\n  -- Select all rows from the 'activity_users' CTE\n  (SELECT * FROM activity_users au\n  -- Combine the results from 'activity_users' with the results from 'fallback_course_users'\n  UNION ALL\n  -- Select rows from the 'fallback_course_users' CTE only if there are no rows in 'activity_users'\n  SELECT * FROM fallback_course_users\n  )"]);
    }

}
