import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateCourseActivityColumns1678132295166 implements MigrationInterface {
  name = 'UpdateCourseActivityColumns1678132295166'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "CourseActivities" DROP CONSTRAINT "FK_4664fe280a7a38550be4e43dd31"`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" DROP CONSTRAINT "FK_dddb0e7d2b4f07a7a3368c87601"`
    )
    await queryRunner.query(`ALTER TABLE "CourseActivities" DROP COLUMN "resource_id"`)
    await queryRunner.query(`ALTER TABLE "CourseActivities" DROP COLUMN "resource_version"`)
    await queryRunner.query(`ALTER TABLE "PlayerSessions" DROP COLUMN "resource_id"`)
    await queryRunner.query(
      `ALTER TABLE "CourseActivities" ADD "source" jsonb NOT NULL DEFAULT '{}'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "CourseActivities" DROP COLUMN "source"`)
    await queryRunner.query(`ALTER TABLE "PlayerSessions" ADD "resource_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "CourseActivities" ADD "resource_version" character varying NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "CourseActivities" ADD "resource_id" uuid NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" ADD CONSTRAINT "FK_dddb0e7d2b4f07a7a3368c87601" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseActivities" ADD CONSTRAINT "FK_4664fe280a7a38550be4e43dd31" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }
}
