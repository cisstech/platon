import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTemplateIdOnResources1704843777253 implements MigrationInterface {
  name = 'AddTemplateIdOnResources1704843777253'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Resources" ADD "template_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "Resources" ADD CONSTRAINT "FK_d02c1422aaa865453fb43bab6b5" FOREIGN KEY ("template_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_d02c1422aaa865453fb43bab6b5"`)
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "template_id"`)
  }
}
