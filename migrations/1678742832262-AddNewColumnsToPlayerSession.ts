import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewColumnsToPlayerSession1678742832262 implements MigrationInterface {
  name = 'AddNewColumnsToPlayerSession1678742832262'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PlayerSessions" ADD "grade" integer NOT NULL DEFAULT '-1'`);
    await queryRunner.query(`ALTER TABLE "PlayerSessions" ADD "attempts" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "PlayerSessions" ADD "last_graded_at" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PlayerSessions" DROP COLUMN "last_graded_at"`);
    await queryRunner.query(`ALTER TABLE "PlayerSessions" DROP COLUMN "attempts"`);
    await queryRunner.query(`ALTER TABLE "PlayerSessions" DROP COLUMN "grade"`);
  }

}
