import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTemplateVersionColumnOnResourceEntity1708792807162 implements MigrationInterface {
  name = 'AddTemplateVersionColumnOnResourceEntity1708792807162'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Resources" ADD "template_version" character varying`);
    await queryRunner.query(`CREATE INDEX "Resources_version_idx" ON "Resources" ("template_version") `);

    await queryRunner.query(`
      UPDATE "Resources"
      SET template_version = 'latest'
      WHERE template_id IS NOT NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."Resources_version_idx"`);
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "template_version"`);
  }

}
