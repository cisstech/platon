import { MigrationInterface, QueryRunner } from 'typeorm'

export class DropCourseActivityOrderColumn1678397697988 implements MigrationInterface {
  name = 'DropCourseActivityOrderColumn1678397697988'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "CourseActivities" DROP COLUMN "order"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "CourseActivities" ADD "order" integer NOT NULL`)
  }
}
