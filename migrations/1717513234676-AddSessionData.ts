import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSessionData1717513234676 implements MigrationInterface {
    name = 'AddSessionData1717513234676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "SessionData" ("tid" uuid NOT NULL DEFAULT uuid_generate_v4(), "id" uuid NOT NULL, "user_id" uuid, "parent_id" uuid, "grade" double precision NOT NULL, "attempts" integer NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "last_graded_at" TIMESTAMP, "started_at" TIMESTAMP, "exercise_meta" jsonb, "activity_navigation" jsonb, "resource_id" uuid NOT NULL, "resource_type" character varying NOT NULL, "resource_name" character varying NOT NULL, "resource_owner_id" uuid NOT NULL, "resource_version" character varying NOT NULL, "circle_id" uuid NOT NULL, "circle_name" character varying NOT NULL, "correction_id" uuid, "correction_grade" double precision, "correction_author" uuid, "correction_enabled" boolean, "activity_id" uuid, "activity_open_at" TIMESTAMP, "activity_close_at" TIMESTAMP, "activity_creator_id" uuid, "activity_created_at" TIMESTAMP, "course_id" uuid, "course_name" character varying, "course_created_at" TIMESTAMP, "course_owner_id" uuid, "topics" jsonb, "levels" jsonb, "answers" jsonb, CONSTRAINT "PK_13ff82dd33850a23b6d2f6dc472" PRIMARY KEY ("tid"))`);
        await queryRunner.query(`CREATE INDEX "SessionData_resource_idx" ON "SessionData" ("resource_id") `);
        await queryRunner.query(`CREATE INDEX "SessionData_user_idx" ON "SessionData" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "SessionData" ADD CONSTRAINT "FK_1f94d75cdb6a1b49526ce7b0cfe" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`  insert into public."SessionData" (
            id,
            user_id,
            parent_id,
            grade,
            attempts,
            created_at,
            updated_at,
            last_graded_at,
            started_at,
            resource_version,
            exercise_meta,
            activity_navigation,
            resource_id,
            resource_type,
            resource_name,
            resource_owner_id,
            circle_id,
            circle_name,
            correction_id,
            correction_grade,
            correction_author,
            correction_enabled,
            activity_id,
            activity_open_at,
            activity_close_at,
            activity_creator_id,
            activity_created_at,
            course_id,
            course_name,
            course_created_at,
            course_owner_id,
            topics,
            levels,
            answers
        )
          SELECT
              -- Fetching session related columns
              session.id,
              session.user_id,
              session.parent_id,
              session.grade,
              session.attempts,
              session.created_at,
              session.updated_at,
              session.last_graded_at,
              session.started_at,
              -- Fetching session source and variables related columns
              session.source->>'version' AS resource_version,
              session.variables->'.meta' AS exercise_meta,
              session.variables->'navigation' AS activity_navigation,
              -- Fetching resource related columns
              resource.id  AS resource_id,
              resource.type as resource_type,
              resource.name AS resource_name,
              resource.owner_id AS resource_owner_id,
              -- Fetching circle related columns
              circle.id AS circle_id,
              circle.name AS circle_name,
              -- Fetching correction related columns
              correction.id AS correction_id,
              correction.grade AS correction_grade,
              correction.author_id AS correction_author,
              CASE
                WHEN correctors.id IS NOT NULL THEN true
                ELSE false
              END AS correction_enabled,
              -- Fetching activity related columns
              activity.id AS activity_id,
              activity.open_at AS activity_open_at,
              activity.close_at AS activity_close_at,
              activity.creator_id AS activity_creator_id,
              activity.created_at AS activity_created_at,
              -- Fetching course related columns
              course.id AS course_id,
              course.name AS course_name,
              course.created_at AS course_created_at,
              course.owner_id AS course_owner_id,
              -- Fetching topics, levels, and answers related columns
              topics.matches AS topics,
              levels.matches AS levels,
              answers.matches AS answers
          FROM "Sessions" session
          -- Joining with Resources, Corrections, Activities, and Courses tables
          INNER JOIN "Resources" resource ON resource.id = CAST(session.source->>'resource' AS uuid)
          INNER JOIN "Resources" circle ON circle.id = resource.parent_id
          LEFT JOIN "Corrections" correction ON session.correction_id = correction.id
          LEFT JOIN "Activities" activity ON activity.id = session.activity_id
          LEFT JOIN "Courses" course ON course.id = activity.course_id
          -- Joining with subqueries to fetch aggregated answers, correctors, topics, and levels data
          LEFT JOIN (
              SELECT
                answer.session_id,
                jsonb_agg(
                  jsonb_build_object(
                    'grade', answer.grade,
                    'createdAt', answer.created_at
                  )
                  ORDER BY answer.created_at ASC
                ) AS matches
              FROM "Answers" answer
              GROUP BY answer.session_id
          ) answers ON answers.session_id = session.id
          LEFT JOIN (
            SELECT id, activity_id FROM "ActivityCorrectors" corrector LIMIT 1
          ) AS correctors ON correctors.id IS NOT NULL AND correctors.activity_id = session.activity_id
          LEFT JOIN (
            SELECT
              resource_id,
              json_agg(topic.name) AS matches
            FROM "ResourceTopics"
            INNER JOIN "Topics" topic ON topic.id = topic_id
            GROUP BY resource_id
          ) AS topics ON topics.resource_id = resource.id OR topics.resource_id = circle.id
          LEFT JOIN (
            SELECT
              resource_id,
              json_agg(level.name) AS matches
            FROM "ResourceLevels"
            INNER JOIN "Levels" level ON level.id = level_id
            GROUP BY resource_id
          ) AS levels ON levels.resource_id = resource.id OR levels.resource_id = circle.id`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "SessionData" DROP CONSTRAINT "FK_1f94d75cdb6a1b49526ce7b0cfe"`);
        await queryRunner.query(`DROP INDEX "public"."SessionData_user_idx"`);
        await queryRunner.query(`DROP INDEX "public"."SessionData_resource_idx"`);
        await queryRunner.query(`DROP TABLE "SessionData"`);
    }

}
