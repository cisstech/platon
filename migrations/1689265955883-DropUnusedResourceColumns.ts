import { MigrationInterface, QueryRunner } from 'typeorm'

export class DropUnusedResourceColumns1689265955883 implements MigrationInterface {
  name = 'DropUnusedResourceColumns1689265955883'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_ea3f4c346d69b412a2927c4f52f"`)
    await queryRunner.query(`DROP INDEX "public"."Resources_visibility_idx"`)
    await queryRunner.query(`DROP INDEX "public"."Resources_model_id_idx"`)
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "visibility"`)
    await queryRunner.query(`DROP TYPE "public"."Resources_visibility_enum"`)
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "model_id"`)
    await queryRunner.query(`CREATE INDEX "Resources_personal_idx" ON "Resources" ("personal") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."Resources_personal_idx"`)
    await queryRunner.query(`ALTER TABLE "Resources" ADD "model_id" uuid`)
    await queryRunner.query(`CREATE TYPE "public"."Resources_visibility_enum" AS ENUM('PUBLIC', 'PRIVATE', 'PERSONAL')`)
    await queryRunner.query(`ALTER TABLE "Resources" ADD "visibility" "public"."Resources_visibility_enum" NOT NULL`)
    await queryRunner.query(`CREATE INDEX "Resources_model_id_idx" ON "Resources" ("model_id") `)
    await queryRunner.query(`CREATE INDEX "Resources_visibility_idx" ON "Resources" ("visibility") `)
    await queryRunner.query(
      `ALTER TABLE "Resources" ADD CONSTRAINT "FK_ea3f4c346d69b412a2927c4f52f" FOREIGN KEY ("model_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }
}
