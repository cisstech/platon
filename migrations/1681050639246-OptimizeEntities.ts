import { MigrationInterface, QueryRunner } from 'typeorm'

export class OptimizeEntities1681050639246 implements MigrationInterface {
  name = 'OptimizeEntities1681050639246'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."Topics_name_idx"`)
    await queryRunner.query(`DROP INDEX "public"."Levels_name_idx"`)

    await queryRunner.query(`CREATE UNIQUE INDEX "Topics_name_idx" ON "Topics" (f_unaccent(name)) `)
    await queryRunner.query(`CREATE UNIQUE INDEX "Levels_name_idx" ON "Levels" (f_unaccent(name)) `)

    await queryRunner.query(`DROP INDEX "public"."Activities_section_idx"`)
    await queryRunner.query(`ALTER TABLE "Activities" ADD "creator_id" uuid NOT NULL`)
    await queryRunner.query(
      `CREATE INDEX "Activities_creator_id_idx" ON "Activities" ("creator_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "Activities_section_id_idx" ON "Activities" ("section_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "CourseMembers_user_id_idx" ON "CourseMembers" ("user_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "ActivityCorrectors_member_id_idx" ON "ActivityCorrectors" ("member_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "ActivityCorrectors_user_id_idx" ON "ActivityCorrectors" ("user_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "ActivityMembers_member_id_idx" ON "ActivityMembers" ("member_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "ActivityMembers_user_id_idx" ON "ActivityMembers" ("user_id") `
    )
    await queryRunner.query(
      `ALTER TABLE "Activities" ADD CONSTRAINT "FK_582bc792fe84da567be12511f60" FOREIGN KEY ("creator_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Activities" DROP CONSTRAINT "FK_582bc792fe84da567be12511f60"`
    )
    await queryRunner.query(`DROP INDEX "public"."ActivityMembers_user_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."ActivityMembers_member_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."ActivityCorrectors_user_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."ActivityCorrectors_member_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."CourseMembers_user_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."Activities_section_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."Activities_creator_id_idx"`)
    await queryRunner.query(`ALTER TABLE "Activities" DROP COLUMN "creator_id"`)
    await queryRunner.query(
      `CREATE INDEX "Activities_section_idx" ON "Activities" ("course_id", "section_id") `
    )
  }
}
