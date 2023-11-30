import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateTables1679938776451 implements MigrationInterface {
  name = 'UpdateTables1679938776451'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "CourseActivityMembers" ("activity_id" uuid NOT NULL, "member_id" uuid NOT NULL, CONSTRAINT "PK_08bd1dfdda277ff40721a28094f" PRIMARY KEY ("activity_id", "member_id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_3fabd37d14c4d00a506312d618" ON "CourseActivityMembers" ("activity_id") `)
    await queryRunner.query(`CREATE INDEX "IDX_11ea4d9d96617503da7f592aae" ON "CourseActivityMembers" ("member_id") `)
    await queryRunner.query(`ALTER TABLE "CourseActivities" ADD "open_at" TIMESTAMP WITH TIME ZONE`)
    await queryRunner.query(`ALTER TABLE "CourseActivities" ADD "close_at" TIMESTAMP WITH TIME ZONE`)
    await queryRunner.query(`CREATE INDEX "CourseActivities_open_at_idx" ON "CourseActivities" ("open_at") `)
    await queryRunner.query(`CREATE INDEX "CourseActivities_close_at_idx" ON "CourseActivities" ("close_at") `)
    await queryRunner.query(
      `ALTER TABLE "CourseActivityMembers" ADD CONSTRAINT "FK_3fabd37d14c4d00a506312d618b" FOREIGN KEY ("activity_id") REFERENCES "CourseActivities"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseActivityMembers" ADD CONSTRAINT "FK_11ea4d9d96617503da7f592aae0" FOREIGN KEY ("member_id") REFERENCES "CourseMembers"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "CourseActivityMembers" DROP CONSTRAINT "FK_11ea4d9d96617503da7f592aae0"`)
    await queryRunner.query(`ALTER TABLE "CourseActivityMembers" DROP CONSTRAINT "FK_3fabd37d14c4d00a506312d618b"`)
    await queryRunner.query(`DROP INDEX "public"."CourseActivities_close_at_idx"`)
    await queryRunner.query(`DROP INDEX "public"."CourseActivities_open_at_idx"`)
    await queryRunner.query(`ALTER TABLE "CourseActivities" DROP COLUMN "close_at"`)
    await queryRunner.query(`ALTER TABLE "CourseActivities" DROP COLUMN "open_at"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_11ea4d9d96617503da7f592aae"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3fabd37d14c4d00a506312d618"`)
    await queryRunner.query(`DROP TABLE "CourseActivityMembers"`)
  }
}
