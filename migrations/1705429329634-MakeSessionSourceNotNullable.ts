import { MigrationInterface, QueryRunner } from 'typeorm'

export class MakeSessionSourceNotNullable1705429329634 implements MigrationInterface {
  name = 'MakeSessionSourceNotNullable1705429329634'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "Sessions" WHERE "source" IS NULL`)
    await queryRunner.query(`ALTER TABLE "Sessions" ALTER COLUMN "source" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "Sessions" ALTER COLUMN "is_built" SET NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Sessions" ALTER COLUMN "is_built" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "Sessions" ALTER COLUMN "source" DROP NOT NULL`)
  }
}
