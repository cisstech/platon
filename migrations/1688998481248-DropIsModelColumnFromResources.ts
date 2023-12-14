import { MigrationInterface, QueryRunner } from 'typeorm'

export class DropIsModelColumnFromResources1688998481248 implements MigrationInterface {
  name = 'DropIsModelColumnFromResources1688998481248'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."Resources_is_model_idx"`)
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "is_model"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Resources" ADD "is_model" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`CREATE INDEX "Resources_is_model_idx" ON "Resources" ("is_model") `)
  }
}
