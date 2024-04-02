import { MigrationInterface, QueryRunner } from "typeorm"


/**
 * This migration fixes the grade of activities that have a grade of 0 due to a bug in player manager that
 * always set the grade of the activity to the last exercise grade, instead of the average of all exercises.
 *
 * The query updates the acttivity grade to the average of all exercises while handling special cases where :
 * - all exercises have a grade of -1 (activity grade should be -1)
 * - exercises that have a grade of -1 should not be considered in the average if there are other exercises with a grade > 0
 */
export class FixActivityGrades1709149074703 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH avg_grades AS (
          SELECT parent_id,
          CASE
              -- if the count of all grades is equal to the count of grades that are -1. If they are equal,
              -- it means all grades are -1, so it sets the average grade to -1.
              WHEN COUNT(*) = COUNT(CASE WHEN grade = -1 THEN 1 END) THEN -1
              -- Otherwise, it calculates the average of the grades, treating grades less than 0 as 0.
              ELSE AVG(GREATEST(grade, 0))
          END as avg_grade
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
