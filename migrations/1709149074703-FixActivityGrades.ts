import { MigrationInterface, QueryRunner } from "typeorm"

export class FixActivityGrades1709149074703 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH avg_grades AS (
          SELECT parent_id, AVG(grade) as avg_grade
          FROM "Sessions"
          WHERE parent_id IS NOT NULL
          GROUP BY parent_id
      )
      UPDATE "Sessions" s
      SET grade = (
          SELECT avg_grade
          FROM avg_grades
          WHERE s.id = avg_grades.parent_id
      )
      WHERE id IN (SELECT parent_id FROM avg_grades);
    `)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
