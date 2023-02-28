import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStartedAtColumnToPlayerSessions1677441285883 implements MigrationInterface {
  name = 'AddStartedAtColumnToPlayerSessions1677441285883'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PlayerSessions" ADD "started_at" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PlayerSessions" DROP COLUMN "started_at"`);
  }

}
