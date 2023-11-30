import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddWaitingColumnOnResourceMembers1701012325912 implements MigrationInterface {
  name = 'AddWaitingColumnOnResourceMembers1701012325912'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ResourceMembers" ADD "waiting" boolean NOT NULL DEFAULT false`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP COLUMN "waiting"`)
  }
}
