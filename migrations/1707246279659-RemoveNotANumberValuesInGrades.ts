import { MigrationInterface, QueryRunner } from "typeorm"

export class RemoveNotANumberValuesInGrades1707246279659 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "Sessions"
      SET grade = -1
      WHERE grade = 'NaN'
    `)

    await queryRunner.query(`
      UPDATE "Answers"
      SET grade = -1
      WHERE grade = 'NaN'
    `)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
