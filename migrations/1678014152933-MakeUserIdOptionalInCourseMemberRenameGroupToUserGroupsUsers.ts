import { MigrationInterface, QueryRunner } from 'typeorm'

export class MakeUserIdOptionalInCourseMemberRenameGroupToUserGroupsUsers1678014152933 implements MigrationInterface {
  name = 'MakeUserIdOptionalInCourseMemberRenameGroupToUserGroupsUsers1678014152933'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP CONSTRAINT "CourseMembers_unique_idx"`)
    await queryRunner.query(
      `CREATE TABLE "UserGroupsUsers" ("group_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_39988ad1ed21b0256f94d1fa746" PRIMARY KEY ("group_id", "user_id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_f6a956d8c5140accecc5932bcf" ON "UserGroupsUsers" ("group_id") `)
    await queryRunner.query(`CREATE INDEX "IDX_a7a04b4af2ac1c12b7be1555a2" ON "UserGroupsUsers" ("user_id") `)
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP CONSTRAINT "FK_0fe0c8fe001f97079be532dd78b"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" ALTER COLUMN "user_id" DROP NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "CourseMembers" ADD CONSTRAINT "CourseMembers_unique_group_idx" UNIQUE ("course_id", "group_id")`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseMembers" ADD CONSTRAINT "CourseMembers_unique_user_idx" UNIQUE ("course_id", "user_id")`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseMembers" ADD CONSTRAINT "FK_0fe0c8fe001f97079be532dd78b" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "UserGroupsUsers" ADD CONSTRAINT "FK_f6a956d8c5140accecc5932bcf0" FOREIGN KEY ("group_id") REFERENCES "UserGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "UserGroupsUsers" ADD CONSTRAINT "FK_a7a04b4af2ac1c12b7be1555a24" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "UserGroupsUsers" DROP CONSTRAINT "FK_a7a04b4af2ac1c12b7be1555a24"`)
    await queryRunner.query(`ALTER TABLE "UserGroupsUsers" DROP CONSTRAINT "FK_f6a956d8c5140accecc5932bcf0"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP CONSTRAINT "FK_0fe0c8fe001f97079be532dd78b"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP CONSTRAINT "CourseMembers_unique_user_idx"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP CONSTRAINT "CourseMembers_unique_group_idx"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" ALTER COLUMN "user_id" SET NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "CourseMembers" ADD CONSTRAINT "FK_0fe0c8fe001f97079be532dd78b" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_a7a04b4af2ac1c12b7be1555a2"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_f6a956d8c5140accecc5932bcf"`)
    await queryRunner.query(`DROP TABLE "UserGroupsUsers"`)
    await queryRunner.query(
      `ALTER TABLE "CourseMembers" ADD CONSTRAINT "CourseMembers_unique_idx" UNIQUE ("user_id", "course_id")`
    )
  }
}
