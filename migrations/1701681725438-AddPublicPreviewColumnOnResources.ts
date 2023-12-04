import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPublicPreviewColumnOnResources1701681725438 implements MigrationInterface {
  name = 'AddPublicPreviewColumnOnResources1701681725438'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Resources" ADD "public_preview" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`CREATE INDEX "Resources_public_preview_idx" ON "Resources" ("public_preview") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."Resources_public_preview_idx"`)
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "public_preview"`)
  }
}
