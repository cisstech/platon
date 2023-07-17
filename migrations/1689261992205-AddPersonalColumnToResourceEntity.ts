import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPersonalColumnToResourceEntity1689261992205 implements MigrationInterface {
  name = 'AddPersonalColumnToResourceEntity1689261992205'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Resources" ADD "personal" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`UPDATE "Resources" SET personal = true WHERE visibility = 'PERSONAL'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "personal"`)
  }
}
