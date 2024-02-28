import { MigrationInterface, QueryRunner } from "typeorm"

export class FillExerciseSessionsSucceededAtColumn1709150238374 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH success_dates AS (
          SELECT session_id, MIN(created_at) as success_date
          FROM "Answers"
          WHERE grade = 100
          GROUP BY session_id
      )
      UPDATE "Sessions" s
      SET succeeded_at = (
          SELECT success_date
          FROM success_dates
          WHERE s.id = success_dates.session_id
      )
      WHERE s.parent_id IS NOT NULL;
    `)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
