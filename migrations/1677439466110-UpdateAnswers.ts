import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAnswers1677439466110 implements MigrationInterface {
  name = 'UpdateAnswers1677439466110'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PlayerAnswers" RENAME COLUMN "answers" TO "variables"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PlayerAnswers" RENAME COLUMN "variables" TO "answers"`);
  }

}
