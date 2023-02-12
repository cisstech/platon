import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResourceStatsView1676216541534 implements MigrationInterface {
  name = 'AddResourceStatsView1676216541534'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE MATERIALIZED VIEW "ResourceStats" AS SELECT "resource"."id" AS "id", "resource"."name" AS "name", COUNT("member"."id") AS "members", COUNT("watcher"."id") AS "watchers", COUNT("child"."id") AS "children", SUM(CASE WHEN "child"."type" = 'CIRCLE' THEN 1 ELSE 0 END)  AS "circles", SUM(CASE WHEN "child"."type" = 'ACTIVITY' THEN 1 ELSE 0 END)  AS "activities", SUM(CASE WHEN "child"."type" = 'EXERCISE' THEN 1 ELSE 0 END)  AS "exercises", SUM(CASE WHEN "child"."status" = 'READY' THEN 1 ELSE 0 END)  AS "ready", SUM(CASE WHEN "child"."status" = 'DEPRECATED' THEN 1 ELSE 0 END)  AS "deprecated", SUM(CASE WHEN "child"."status" = 'BUGGED' THEN 1 ELSE 0 END)  AS "bugged", SUM(CASE WHEN "child"."status" = 'NOT_TESTED' THEN 1 ELSE 0 END)  AS "not_tested", SUM(CASE WHEN "child"."status" = 'DRAFT' THEN 1 ELSE 0 END)  AS "draft",
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
     AS "score" FROM "Resources" "resource" LEFT JOIN "ResourceMembers" "member" ON "member"."resource_id" = "resource"."id"  LEFT JOIN "ResourceWatchers" "watcher" ON "watcher"."resource_id" = "resource"."id"  LEFT JOIN "Resources" "child" ON "child"."parent_id" = "resource"."id" GROUP BY "resource"."id"`);
    await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public", "MATERIALIZED_VIEW", "ResourceStats", "SELECT \"resource\".\"id\" AS \"id\", \"resource\".\"name\" AS \"name\", COUNT(\"member\".\"id\") AS \"members\", COUNT(\"watcher\".\"id\") AS \"watchers\", COUNT(\"child\".\"id\") AS \"children\", SUM(CASE WHEN \"child\".\"type\" = 'CIRCLE' THEN 1 ELSE 0 END)  AS \"circles\", SUM(CASE WHEN \"child\".\"type\" = 'ACTIVITY' THEN 1 ELSE 0 END)  AS \"activities\", SUM(CASE WHEN \"child\".\"type\" = 'EXERCISE' THEN 1 ELSE 0 END)  AS \"exercises\", SUM(CASE WHEN \"child\".\"status\" = 'READY' THEN 1 ELSE 0 END)  AS \"ready\", SUM(CASE WHEN \"child\".\"status\" = 'DEPRECATED' THEN 1 ELSE 0 END)  AS \"deprecated\", SUM(CASE WHEN \"child\".\"status\" = 'BUGGED' THEN 1 ELSE 0 END)  AS \"bugged\", SUM(CASE WHEN \"child\".\"status\" = 'NOT_TESTED' THEN 1 ELSE 0 END)  AS \"not_tested\", SUM(CASE WHEN \"child\".\"status\" = 'DRAFT' THEN 1 ELSE 0 END)  AS \"draft\", \n    (\n\n        (COUNT(\"member\".\"id\") + COUNT(\"watcher\".\"id\") + COUNT(\"child\".\"id\")) * 10 +\n        SUM(CASE WHEN \"child\".\"status\" = 'READY' THEN 1 ELSE 0 END) * 5 -\n        SUM(CASE WHEN \"child\".\"status\" = 'BUGGED' THEN 1 ELSE 0 END) * 10 -\n        SUM(CASE WHEN \"child\".\"status\" = 'DEPRECATED' THEN 1 ELSE 0 END) * 5 -\n        SUM(CASE WHEN \"child\".\"status\" = 'NOT_TESTED' THEN 1 ELSE 0 END) * 2 -\n        SUM(CASE WHEN \"child\".\"status\" = 'DRAFT' THEN 1 ELSE 0 END) +\n        -- The more recently a resource is updated, the higher its score will be.\n          (((EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM \"resource\".\"updated_at\")) / (60 * 60 * 24)) / 30)\n      )\n     AS \"score\" FROM \"Resources\" \"resource\" LEFT JOIN \"ResourceMembers\" \"member\" ON \"member\".\"resource_id\" = \"resource\".\"id\"  LEFT JOIN \"ResourceWatchers\" \"watcher\" ON \"watcher\".\"resource_id\" = \"resource\".\"id\"  LEFT JOIN \"Resources\" \"child\" ON \"child\".\"parent_id\" = \"resource\".\"id\" GROUP BY \"resource\".\"id\""]);
    await queryRunner.query(`CREATE INDEX "IDX_90423e56a0b8338517b720074c" ON "ResourceStats" ("id") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_90423e56a0b8338517b720074c"`);
    await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW", "ResourceStats", "public"]);
    await queryRunner.query(`DROP MATERIALIZED VIEW "ResourceStats"`);
  }

}
