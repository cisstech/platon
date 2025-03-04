import { MigrationInterface, QueryRunner } from "typeorm";

export class LeaderBoardViewOptimisation1734004653388 implements MigrationInterface {
    name = 'LeaderBoardViewOptimisation1734004653388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","LeaderboardView","public"]);
        await queryRunner.query(`DROP VIEW "LeaderboardView"`);
        await queryRunner.query(`CREATE VIEW "LeaderboardView" AS 
    WITH RankedSessions AS (
      SELECT
        session.id,
        session.user_id,
        session.activity_id,
        COALESCE(correction.grade, session.grade) as grade,
        session.started_at,
        session.succeeded_at,
        session.last_graded_at,
        ROW_NUMBER() OVER (
          ORDER BY
            COALESCE(correction.grade, session.grade) DESC,
            session.succeeded_at ASC,
            session.last_graded_at - session.started_at ASC
        ) AS session_rank
      FROM "Sessions" session
      LEFT JOIN "Corrections" correction ON correction.id = session.correction_id
      WHERE
        session.activity_id IS NOT NULL
        AND session.user_id IS NOT NULL
        AND session.parent_id IS NULL
        AND session.succeeded_at IS NOT NULL
    )
    SELECT
      id,
      user_id,
      activity_id,
      grade,
      started_at,
      succeeded_at,
      last_graded_at
    FROM RankedSessions
  `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","LeaderboardView","WITH RankedSessions AS (\n      SELECT\n        session.id,\n        session.user_id,\n        session.activity_id,\n        COALESCE(correction.grade, session.grade) as grade,\n        session.started_at,\n        session.succeeded_at,\n        session.last_graded_at,\n        ROW_NUMBER() OVER (\n          ORDER BY\n            COALESCE(correction.grade, session.grade) DESC,\n            session.succeeded_at ASC,\n            session.last_graded_at - session.started_at ASC\n        ) AS session_rank\n      FROM \"Sessions\" session\n      LEFT JOIN \"Corrections\" correction ON correction.id = session.correction_id\n      WHERE\n        session.activity_id IS NOT NULL\n        AND session.user_id IS NOT NULL\n        AND session.parent_id IS NULL\n        AND session.succeeded_at IS NOT NULL\n    )\n    SELECT\n      id,\n      user_id,\n      activity_id,\n      grade,\n      started_at,\n      succeeded_at,\n      last_graded_at\n    FROM RankedSessions"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","LeaderboardView","public"]);
        await queryRunner.query(`DROP VIEW "LeaderboardView"`);
        await queryRunner.query(`CREATE VIEW "LeaderboardView" AS -- Subquery to rank sessions by grade and and duration
    WITH RankedSessions AS (
      SELECT
        session.id,
        activity.course_id,
        session.user_id,
        session.parent_id,
        session.activity_id,
        COALESCE(correction.grade, session.grade) as grade,
        session.started_at,
        session.succeeded_at,
        session.last_graded_at,
        session.source->>'resource' as resource_id,
        ROW_NUMBER() OVER (
          ORDER BY
          COALESCE(correction.grade, session.grade) DESC,
          session.succeeded_at ASC,
          session.last_graded_at - session.started_at ASC
        ) AS rank
      FROM "Sessions" session
      INNER JOIN "Activities" activity ON activity.id = session.activity_id
      LEFT JOIN "Corrections" correction ON correction.id = session.correction_id
      WHERE
        session.activity_id IS NOT NULL
        AND session.user_id IS NOT NULL
        AND session.succeeded_at IS NOT NULL
    )

    -- Main query to order sessions by rank
    SELECT
      id,
      user_id,
      course_id,
      parent_id,
      activity_id,
      resource_id,
      grade,
      started_at,
      succeeded_at,
      last_graded_at
    FROM RankedSessions session
    ORDER BY rank`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","LeaderboardView","-- Subquery to rank sessions by grade and and duration\n    WITH RankedSessions AS (\n      SELECT\n        session.id,\n        activity.course_id,\n        session.user_id,\n        session.parent_id,\n        session.activity_id,\n        COALESCE(correction.grade, session.grade) as grade,\n        session.started_at,\n        session.succeeded_at,\n        session.last_graded_at,\n        session.source->>'resource' as resource_id,\n        ROW_NUMBER() OVER (\n          ORDER BY\n          COALESCE(correction.grade, session.grade) DESC,\n          session.succeeded_at ASC,\n          session.last_graded_at - session.started_at ASC\n        ) AS rank\n      FROM \"Sessions\" session\n      INNER JOIN \"Activities\" activity ON activity.id = session.activity_id\n      LEFT JOIN \"Corrections\" correction ON correction.id = session.correction_id\n      WHERE\n        session.activity_id IS NOT NULL\n        AND session.user_id IS NOT NULL\n        AND session.succeeded_at IS NOT NULL\n    )\n\n    -- Main query to order sessions by rank\n    SELECT\n      id,\n      user_id,\n      course_id,\n      parent_id,\n      activity_id,\n      resource_id,\n      grade,\n      started_at,\n      succeeded_at,\n      last_graded_at\n    FROM RankedSessions session\n    ORDER BY rank"]);
    }

}
