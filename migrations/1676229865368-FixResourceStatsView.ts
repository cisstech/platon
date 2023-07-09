import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixResourceStatsView1676229865368 implements MigrationInterface {
  name = 'FixResourceStatsView1676229865368'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'ResourceStats', 'public']
    )
    await queryRunner.query(`DROP MATERIALIZED VIEW "ResourceStats"`)
    await queryRunner.query(`CREATE MATERIALIZED VIEW "ResourceStats" AS SELECT resource.id AS "id", resource.name AS "name", resource.members AS "members", resource.watchers AS "watchers", resource.events AS "events", SUM(CASE WHEN resource.id = "child"."parent_id" THEN 1 ELSE 0 END) AS "children", SUM(CASE WHEN "child"."type" = 'CIRCLE' THEN 1 ELSE 0 END) AS "circles", SUM(CASE WHEN "child"."type" = 'ACTIVITY' THEN 1 ELSE 0 END) AS "activities", SUM(CASE WHEN "child"."type" = 'EXERCISE' THEN 1 ELSE 0 END) AS "exercises", SUM(CASE WHEN "child"."status" = 'READY' THEN 1 ELSE 0 END) AS "ready", SUM(CASE WHEN "child"."status" = 'DEPRECATED' THEN 1 ELSE 0 END) AS "deprecated", SUM(CASE WHEN "child"."status" = 'BUGGED' THEN 1 ELSE 0 END) AS "bugged", SUM(CASE WHEN "child"."status" = 'NOT_TESTED' THEN 1 ELSE 0 END) AS "not_tested", SUM(CASE WHEN "child"."status" = 'DRAFT' THEN 1 ELSE 0 END) AS "draft",
    (
      (
        resource.members +
        resource.watchers +
        resource.events +
        SUM(CASE WHEN resource.id = "child"."parent_id" THEN 1 ELSE 0 END)
      ) * 10 +
        SUM(CASE WHEN "child"."status" = 'READY' THEN 1 ELSE 0 END) * 5 -
        SUM(CASE WHEN "child"."status" = 'BUGGED' THEN 1 ELSE 0 END) * 10 -
        SUM(CASE WHEN "child"."status" = 'DEPRECATED' THEN 1 ELSE 0 END) * 5 -
        SUM(CASE WHEN "child"."status" = 'NOT_TESTED' THEN 1 ELSE 0 END) * 2 -
        SUM(CASE WHEN "child"."status" = 'DRAFT' THEN 1 ELSE 0 END) +
        -- The more recently a resource is updated, the higher its score will be.
          (((EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM resource.updated_at)) / (60 * 60 * 24)) / 30)
      )
     AS "score" FROM (SELECT "resource"."id" AS "id", "resource"."name" AS "name", "resource"."updated_at" AS "updated_at", COUNT(DISTINCT "member"."id") AS "members", COUNT(DISTINCT "watcher"."id") AS "watchers", COUNT(DISTINCT "event"."id") AS "events" FROM "Resources" "resource" LEFT JOIN "ResourceMembers" "member" ON "member"."resource_id" = "resource"."id"  LEFT JOIN "ResourceWatchers" "watcher" ON "watcher"."resource_id" = "resource"."id"  LEFT JOIN "ResourceEvents" "event" ON "event"."resource_id" = "resource"."id" GROUP BY "resource"."id") "resource" LEFT JOIN "Resources" "child" ON "child"."parent_id" = resource.id GROUP BY resource.id, resource.name, resource.updated_at, resource.members, resource.watchers, resource.events`)
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'MATERIALIZED_VIEW',
        'ResourceStats',
        'SELECT resource.id AS "id", resource.name AS "name", resource.members AS "members", resource.watchers AS "watchers", resource.events AS "events", SUM(CASE WHEN resource.id = "child"."parent_id" THEN 1 ELSE 0 END) AS "children", SUM(CASE WHEN "child"."type" = \'CIRCLE\' THEN 1 ELSE 0 END) AS "circles", SUM(CASE WHEN "child"."type" = \'ACTIVITY\' THEN 1 ELSE 0 END) AS "activities", SUM(CASE WHEN "child"."type" = \'EXERCISE\' THEN 1 ELSE 0 END) AS "exercises", SUM(CASE WHEN "child"."status" = \'READY\' THEN 1 ELSE 0 END) AS "ready", SUM(CASE WHEN "child"."status" = \'DEPRECATED\' THEN 1 ELSE 0 END) AS "deprecated", SUM(CASE WHEN "child"."status" = \'BUGGED\' THEN 1 ELSE 0 END) AS "bugged", SUM(CASE WHEN "child"."status" = \'NOT_TESTED\' THEN 1 ELSE 0 END) AS "not_tested", SUM(CASE WHEN "child"."status" = \'DRAFT\' THEN 1 ELSE 0 END) AS "draft", \n    (\n      (\n        resource.members +\n        resource.watchers +\n        resource.events +\n        SUM(CASE WHEN resource.id = "child"."parent_id" THEN 1 ELSE 0 END)\n      ) * 10 +\n        SUM(CASE WHEN "child"."status" = \'READY\' THEN 1 ELSE 0 END) * 5 -\n        SUM(CASE WHEN "child"."status" = \'BUGGED\' THEN 1 ELSE 0 END) * 10 -\n        SUM(CASE WHEN "child"."status" = \'DEPRECATED\' THEN 1 ELSE 0 END) * 5 -\n        SUM(CASE WHEN "child"."status" = \'NOT_TESTED\' THEN 1 ELSE 0 END) * 2 -\n        SUM(CASE WHEN "child"."status" = \'DRAFT\' THEN 1 ELSE 0 END) +\n        -- The more recently a resource is updated, the higher its score will be.\n          (((EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM resource.updated_at)) / (60 * 60 * 24)) / 30)\n      )\n     AS "score" FROM (SELECT "resource"."id" AS "id", "resource"."name" AS "name", "resource"."updated_at" AS "updated_at", COUNT(DISTINCT "member"."id") AS "members", COUNT(DISTINCT "watcher"."id") AS "watchers", COUNT(DISTINCT "event"."id") AS "events" FROM "Resources" "resource" LEFT JOIN "ResourceMembers" "member" ON "member"."resource_id" = "resource"."id"  LEFT JOIN "ResourceWatchers" "watcher" ON "watcher"."resource_id" = "resource"."id"  LEFT JOIN "ResourceEvents" "event" ON "event"."resource_id" = "resource"."id" GROUP BY "resource"."id") "resource" LEFT JOIN "Resources" "child" ON "child"."parent_id" = resource.id GROUP BY resource.id, resource.name, resource.updated_at, resource.members, resource.watchers, resource.events',
      ]
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_90423e56a0b8338517b720074c" ON "ResourceStats" ("id") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_90423e56a0b8338517b720074c"`)
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'ResourceStats', 'public']
    )
    await queryRunner.query(`DROP MATERIALIZED VIEW "ResourceStats"`)
    await queryRunner.query(`CREATE MATERIALIZED VIEW "ResourceStats" AS SELECT "resource"."id" AS "id", "resource"."name" AS "name", COUNT(DISTINCT "member"."id") AS "members", COUNT(DISTINCT "watcher"."id") AS "watchers", COUNT(DISTINCT "child"."id") AS "children", SUM(CASE WHEN "child"."type" = 'CIRCLE' THEN 1 ELSE 0 END)  AS "circles", SUM(CASE WHEN "child"."type" = 'ACTIVITY' THEN 1 ELSE 0 END)  AS "activities", SUM(CASE WHEN "child"."type" = 'EXERCISE' THEN 1 ELSE 0 END)  AS "exercises", SUM(CASE WHEN "child"."status" = 'READY' THEN 1 ELSE 0 END)  AS "ready", SUM(CASE WHEN "child"."status" = 'DEPRECATED' THEN 1 ELSE 0 END)  AS "deprecated", SUM(CASE WHEN "child"."status" = 'BUGGED' THEN 1 ELSE 0 END)  AS "bugged", SUM(CASE WHEN "child"."status" = 'NOT_TESTED' THEN 1 ELSE 0 END)  AS "not_tested", SUM(CASE WHEN "child"."status" = 'DRAFT' THEN 1 ELSE 0 END)  AS "draft",
    (

        (COUNT("member"."id") + COUNT("watcher"."id") + COUNT("child"."id")) * 10 +
        SUM(CASE WHEN "child"."status" = 'READY' THEN 1 ELSE 0 END) * 5 -
        SUM(CASE WHEN "child"."status" = 'BUGGED' THEN 1 ELSE 0 END) * 10 -
        SUM(CASE WHEN "child"."status" = 'DEPRECATED' THEN 1 ELSE 0 END) * 5 -
        SUM(CASE WHEN "child"."status" = 'NOT_TESTED' THEN 1 ELSE 0 END) * 2 -
        SUM(CASE WHEN "child"."status" = 'DRAFT' THEN 1 ELSE 0 END) +
        -- The more recently a resource is updated, the higher its score will be.
          (((EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM "resource"."updated_at")) / (60 * 60 * 24)) / 30)
      )
     AS "score" FROM "Resources" "resource" LEFT JOIN "ResourceMembers" "member" ON "member"."resource_id" = "resource"."id"  LEFT JOIN "ResourceWatchers" "watcher" ON "watcher"."resource_id" = "resource"."id"  LEFT JOIN "Resources" "child" ON "child"."parent_id" = "resource"."id" GROUP BY "resource"."id"`)
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'MATERIALIZED_VIEW',
        'ResourceStats',
        'SELECT "resource"."id" AS "id", "resource"."name" AS "name", COUNT(DISTINCT "member"."id") AS "members", COUNT(DISTINCT "watcher"."id") AS "watchers", COUNT(DISTINCT "child"."id") AS "children", SUM(CASE WHEN "child"."type" = \'CIRCLE\' THEN 1 ELSE 0 END)  AS "circles", SUM(CASE WHEN "child"."type" = \'ACTIVITY\' THEN 1 ELSE 0 END)  AS "activities", SUM(CASE WHEN "child"."type" = \'EXERCISE\' THEN 1 ELSE 0 END)  AS "exercises", SUM(CASE WHEN "child"."status" = \'READY\' THEN 1 ELSE 0 END)  AS "ready", SUM(CASE WHEN "child"."status" = \'DEPRECATED\' THEN 1 ELSE 0 END)  AS "deprecated", SUM(CASE WHEN "child"."status" = \'BUGGED\' THEN 1 ELSE 0 END)  AS "bugged", SUM(CASE WHEN "child"."status" = \'NOT_TESTED\' THEN 1 ELSE 0 END)  AS "not_tested", SUM(CASE WHEN "child"."status" = \'DRAFT\' THEN 1 ELSE 0 END)  AS "draft", \n    (\n\n        (COUNT("member"."id") + COUNT("watcher"."id") + COUNT("child"."id")) * 10 +\n        SUM(CASE WHEN "child"."status" = \'READY\' THEN 1 ELSE 0 END) * 5 -\n        SUM(CASE WHEN "child"."status" = \'BUGGED\' THEN 1 ELSE 0 END) * 10 -\n        SUM(CASE WHEN "child"."status" = \'DEPRECATED\' THEN 1 ELSE 0 END) * 5 -\n        SUM(CASE WHEN "child"."status" = \'NOT_TESTED\' THEN 1 ELSE 0 END) * 2 -\n        SUM(CASE WHEN "child"."status" = \'DRAFT\' THEN 1 ELSE 0 END) +\n        -- The more recently a resource is updated, the higher its score will be.\n          (((EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM "resource"."updated_at")) / (60 * 60 * 24)) / 30)\n      )\n     AS "score" FROM "Resources" "resource" LEFT JOIN "ResourceMembers" "member" ON "member"."resource_id" = "resource"."id"  LEFT JOIN "ResourceWatchers" "watcher" ON "watcher"."resource_id" = "resource"."id"  LEFT JOIN "Resources" "child" ON "child"."parent_id" = "resource"."id" GROUP BY "resource"."id"',
      ]
    )
  }
}
