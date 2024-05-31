import { MigrationInterface, QueryRunner } from "typeorm";

export class MaterializedSessionView1717147354567 implements MigrationInterface {
    name = 'MaterializedSessionView1717147354567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE MATERIALIZED VIEW "MaterializedSessionView" AS 
  -- This query is used to fetch session related data from various tables.
  -- The result is a comprehensive view of session data, including related resources, activities, courses, and more.

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
  ) AS levels ON levels.resource_id = resource.id OR levels.resource_id = circle.id
  `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","MaterializedSessionView","-- This query is used to fetch session related data from various tables.\n  -- The result is a comprehensive view of session data, including related resources, activities, courses, and more.\n\n  SELECT\n      -- Fetching session related columns\n      session.id,\n      session.user_id,\n      session.parent_id,\n      session.grade,\n      session.attempts,\n      session.created_at,\n      session.updated_at,\n      session.last_graded_at,\n      session.started_at,\n\n      -- Fetching session source and variables related columns\n      session.source->>'version' AS resource_version,\n      session.variables->'.meta' AS exercise_meta,\n      session.variables->'navigation' AS activity_navigation,\n\n      -- Fetching resource related columns\n      resource.id  AS resource_id,\n      resource.type as resource_type,\n      resource.name AS resource_name,\n      resource.owner_id AS resource_owner_id,\n\n      -- Fetching circle related columns\n      circle.id AS circle_id,\n      circle.name AS circle_name,\n\n      -- Fetching correction related columns\n      correction.id AS correction_id,\n      correction.grade AS correction_grade,\n      correction.author_id AS correction_author,\n      CASE\n        WHEN correctors.id IS NOT NULL THEN true\n        ELSE false\n      END AS correction_enabled,\n\n      -- Fetching activity related columns\n      activity.id AS activity_id,\n      activity.open_at AS activity_open_at,\n      activity.close_at AS activity_close_at,\n      activity.creator_id AS activity_creator_id,\n      activity.created_at AS activity_created_at,\n\n      -- Fetching course related columns\n      course.id AS course_id,\n      course.name AS course_name,\n      course.created_at AS course_created_at,\n      course.owner_id AS course_owner_id,\n\n      -- Fetching topics, levels, and answers related columns\n      topics.matches AS topics,\n      levels.matches AS levels,\n      answers.matches AS answers\n\n  FROM \"Sessions\" session\n\n  -- Joining with Resources, Corrections, Activities, and Courses tables\n  INNER JOIN \"Resources\" resource ON resource.id = CAST(session.source->>'resource' AS uuid)\n  INNER JOIN \"Resources\" circle ON circle.id = resource.parent_id\n  LEFT JOIN \"Corrections\" correction ON session.correction_id = correction.id\n  LEFT JOIN \"Activities\" activity ON activity.id = session.activity_id\n  LEFT JOIN \"Courses\" course ON course.id = activity.course_id\n\n  -- Joining with subqueries to fetch aggregated answers, correctors, topics, and levels data\n  LEFT JOIN (\n      SELECT\n        answer.session_id,\n        jsonb_agg(\n          jsonb_build_object(\n            'grade', answer.grade,\n            'createdAt', answer.created_at\n          )\n          ORDER BY answer.created_at ASC\n        ) AS matches\n      FROM \"Answers\" answer\n      GROUP BY answer.session_id\n  ) answers ON answers.session_id = session.id\n\n  LEFT JOIN (\n    SELECT id, activity_id FROM \"ActivityCorrectors\" corrector LIMIT 1\n  ) AS correctors ON correctors.id IS NOT NULL AND correctors.activity_id = session.activity_id\n\n  LEFT JOIN (\n    SELECT\n      resource_id,\n      json_agg(topic.name) AS matches\n    FROM \"ResourceTopics\"\n    INNER JOIN \"Topics\" topic ON topic.id = topic_id\n    GROUP BY resource_id\n  ) AS topics ON topics.resource_id = resource.id OR topics.resource_id = circle.id\n\n  LEFT JOIN (\n    SELECT\n      resource_id,\n      json_agg(level.name) AS matches\n    FROM \"ResourceLevels\"\n    INNER JOIN \"Levels\" level ON level.id = level_id\n    GROUP BY resource_id\n  ) AS levels ON levels.resource_id = resource.id OR levels.resource_id = circle.id"]);
        await queryRunner.query(`CREATE INDEX "IDX_a25a51c7bedf39cd267e4f3750" ON "MaterializedSessionView" ("id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a25a51c7bedf39cd267e4f3750"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","MaterializedSessionView","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "MaterializedSessionView"`);
    }

}
