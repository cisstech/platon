import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateResourceColumns1676668377184 implements MigrationInterface {
  name = 'UpdateResourceColumns1676668377184'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Resources" ADD "code" character varying`);
    await queryRunner.query(`ALTER TABLE "Resources" ADD "is_model" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "Resources" ADD "model_id" uuid`);
    await queryRunner.query(`CREATE UNIQUE INDEX "Resources_code_idx" ON "Resources" ("code") `);
    await queryRunner.query(`CREATE INDEX "Resources_is_model_idx" ON "Resources" ("is_model") `);
    await queryRunner.query(`CREATE INDEX "Resources_model_id_idx" ON "Resources" ("model_id") `);
    await queryRunner.query(`ALTER TABLE "Resources" ADD CONSTRAINT "FK_ea3f4c346d69b412a2927c4f52f" FOREIGN KEY ("model_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_ea3f4c346d69b412a2927c4f52f"`);
    await queryRunner.query(`DROP INDEX "public"."Resources_model_id_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Resources_is_model_idx"`);
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "model_id"`);
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "is_model"`);
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "code"`);
  }

}
