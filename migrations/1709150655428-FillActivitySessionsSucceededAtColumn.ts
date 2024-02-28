import { MigrationInterface, QueryRunner } from "typeorm"

export class FillActivitySessionsSucceededAtColumn1709150655428 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH latest_success_dates AS (
          SELECT parent_id, MAX(succeeded_at) as latest_success_date
          FROM "Sessions"
          WHERE parent_id IS NOT NULL
          GROUP BY parent_id
      )
      UPDATE "Sessions" s
      SET succeeded_at = (
          SELECT latest_success_date
          FROM latest_success_dates
          WHERE s.id = latest_success_dates.parent_id
      )
      WHERE grade = 100 AND parent_id IS NULL;
    `)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
