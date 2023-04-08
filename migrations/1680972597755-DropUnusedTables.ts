import { MigrationInterface, QueryRunner } from "typeorm"

export class DropUnusedTables1680972597755 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "CourseActivityMembers"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "CourseActivities"`)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
  }
}
