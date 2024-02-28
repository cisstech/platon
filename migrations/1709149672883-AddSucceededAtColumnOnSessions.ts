import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSucceededAtColumnOnSessions1709149672883 implements MigrationInterface {
  name = 'AddSucceededAtColumnOnSessions1709149672883'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Sessions" ADD "succeeded_at" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "succeeded_at"`);
  }
}
