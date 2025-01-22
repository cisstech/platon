import { MigrationInterface, QueryRunner } from "typeorm";

export class LeaderboardViewMaterialized1734018880406 implements MigrationInterface {
    name = 'LeaderboardViewMaterialized1734018880406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","LeaderboardView","public"]);
        await queryRunner.query(`DROP VIEW "LeaderboardView"`);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "LeaderboardView" AS 
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
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","LeaderboardView","WITH RankedSessions AS (\n    SELECT\n      session.id,\n      session.user_id,\n      session.activity_id,\n      COALESCE(correction.grade, session.grade) as grade,\n      session.started_at,\n      session.succeeded_at,\n      session.last_graded_at,\n      ROW_NUMBER() OVER (\n        ORDER BY\n          COALESCE(correction.grade, session.grade) DESC,\n          session.succeeded_at ASC,\n          session.last_graded_at - session.started_at ASC\n      ) AS session_rank\n    FROM \"Sessions\" session\n    LEFT JOIN \"Corrections\" correction ON correction.id = session.correction_id\n    WHERE\n      session.activity_id IS NOT NULL\n      AND session.user_id IS NOT NULL\n      AND session.parent_id IS NULL\n      AND session.succeeded_at IS NOT NULL\n  )\n  SELECT\n    id,\n    user_id,\n    activity_id,\n    grade,\n    started_at,\n    succeeded_at,\n    last_graded_at\n  FROM RankedSessions"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","LeaderboardView","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "LeaderboardView"`);
        await queryRunner.query(`CREATE VIEW "LeaderboardView" AS WITH RankedSessions AS (
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
    FROM RankedSessions`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","LeaderboardView","WITH RankedSessions AS (\n      SELECT\n        session.id,\n        session.user_id,\n        session.activity_id,\n        COALESCE(correction.grade, session.grade) as grade,\n        session.started_at,\n        session.succeeded_at,\n        session.last_graded_at,\n        ROW_NUMBER() OVER (\n          ORDER BY\n            COALESCE(correction.grade, session.grade) DESC,\n            session.succeeded_at ASC,\n            session.last_graded_at - session.started_at ASC\n        ) AS session_rank\n      FROM \"Sessions\" session\n      LEFT JOIN \"Corrections\" correction ON correction.id = session.correction_id\n      WHERE\n        session.activity_id IS NOT NULL\n        AND session.user_id IS NOT NULL\n        AND session.parent_id IS NULL\n        AND session.succeeded_at IS NOT NULL\n    )\n    SELECT\n      id,\n      user_id,\n      activity_id,\n      grade,\n      started_at,\n      succeeded_at,\n      last_graded_at\n    FROM RankedSessions"]);
    }

}
