import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHomeData1791806071483 implements MigrationInterface {
    name = 'AddHomeData1791806071483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Activities" ADD "graded" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "Sessions" ADD "terminated_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`UPDATE "Sessions" SET "terminated_at" = "updated_at" WHERE "parent_id" IS NULL AND "variables"->'navigation'->'terminated' = 'true'::jsonb`);
        await queryRunner.query(`CREATE INDEX "Sessions_user_terminated_idx" ON "Sessions" ("user_id", "terminated_at") WHERE "parent_id" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."Sessions_user_terminated_idx"`);
        await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "terminated_at"`);
        await queryRunner.query(`ALTER TABLE "Activities" DROP COLUMN "graded"`);
    }

}
