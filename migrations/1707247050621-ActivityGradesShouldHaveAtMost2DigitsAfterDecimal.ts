import { MigrationInterface, QueryRunner } from "typeorm"

export class ActivityGradesShouldHaveAtMost2DigitsAfterDecimal1707247050621 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "Sessions"
      SET grade = ROUND(grade::numeric, 2)
      WHERE grade IS NOT NULL AND grade != FLOOR(grade);
    `)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
