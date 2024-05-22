import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActivityGroup1715864831625 implements MigrationInterface {
    name = 'AddActivityGroup1715864831625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ActivityGroup" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "activity_id" uuid NOT NULL, "group_id" uuid NOT NULL, CONSTRAINT "ActivityGroups_activity_group_idx" UNIQUE ("activity_id", "group_id"), CONSTRAINT "PK_8bcf843614faf8b321b673217cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_25217bb07abbc8e52a56358bb8" ON "ActivityGroup" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_44b378140580cb570deef70d32" ON "ActivityGroup" ("updated_at") `);
        await queryRunner.query(`CREATE INDEX "ActivityGroups_activity_id_idx" ON "ActivityGroup" ("activity_id") `);
        await queryRunner.query(`CREATE INDEX "ActivityGroups_group_id_idx" ON "ActivityGroup" ("group_id") `);
        await queryRunner.query(`ALTER TABLE "ActivityGroup" ADD CONSTRAINT "FK_e3ce0971d6ce88c005cfc86a8df" FOREIGN KEY ("activity_id") REFERENCES "Activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ActivityGroup" ADD CONSTRAINT "FK_8fee56d7e1d0d8c6cae991900c1" FOREIGN KEY ("group_id") REFERENCES "CourseGroups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ActivityGroup" DROP CONSTRAINT "FK_8fee56d7e1d0d8c6cae991900c1"`);
        await queryRunner.query(`ALTER TABLE "ActivityGroup" DROP CONSTRAINT "FK_e3ce0971d6ce88c005cfc86a8df"`);
        await queryRunner.query(`DROP INDEX "public"."ActivityGroups_group_id_idx"`);
        await queryRunner.query(`DROP INDEX "public"."ActivityGroups_activity_id_idx"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_44b378140580cb570deef70d32"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_25217bb07abbc8e52a56358bb8"`);
        await queryRunner.query(`DROP TABLE "ActivityGroup"`);
    }

}
