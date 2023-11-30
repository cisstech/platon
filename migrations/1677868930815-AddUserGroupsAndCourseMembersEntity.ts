import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserGroupsAndCourseMembersEntity1677868930815 implements MigrationInterface {
  name = 'AddUserGroupsAndCourseMembersEntity1677868930815'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "UserGroups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_f8840480e6172875eac084b661d" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_3aee2a43a2b66011304b529055" ON "UserGroups" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_bdd234c9d0546c66d5258427a8" ON "UserGroups" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "UserGroups_name_idx" ON "UserGroups" (f_unaccent(name))`)
    await queryRunner.query(
      `CREATE TABLE "CourseMembers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "course_id" uuid NOT NULL, "group_id" uuid, CONSTRAINT "CourseMembers_unique_idx" UNIQUE ("user_id", "course_id"), CONSTRAINT "PK_1be1f09ef09fdc9b8e685030369" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_c29cd877bcaa59bb781bbd426d" ON "CourseMembers" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_67b5aca86c71e51fe125dd96eb" ON "CourseMembers" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "CourseMembers_course_id_idx" ON "CourseMembers" ("course_id") `)
    await queryRunner.query(`CREATE INDEX "CourseMembers_group_id_idx" ON "CourseMembers" ("group_id") `)
    await queryRunner.query(
      `CREATE TABLE "Groups" ("group_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_673fe878700fb3c7bf5e38b007f" PRIMARY KEY ("group_id", "user_id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_9f7abc33c76411bf99f9e3474f" ON "Groups" ("group_id") `)
    await queryRunner.query(`CREATE INDEX "IDX_cb5b2af873dd015294051fd395" ON "Groups" ("user_id") `)
    await queryRunner.query(
      `ALTER TABLE "CourseMembers" ADD CONSTRAINT "FK_0fe0c8fe001f97079be532dd78b" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseMembers" ADD CONSTRAINT "FK_d1ee53034c4424ff52960d8c746" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseMembers" ADD CONSTRAINT "FK_693638072af3ebd7b1c8d944993" FOREIGN KEY ("group_id") REFERENCES "UserGroups"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "Groups" ADD CONSTRAINT "FK_9f7abc33c76411bf99f9e3474fb" FOREIGN KEY ("group_id") REFERENCES "UserGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "Groups" ADD CONSTRAINT "FK_cb5b2af873dd015294051fd3954" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Groups" DROP CONSTRAINT "FK_cb5b2af873dd015294051fd3954"`)
    await queryRunner.query(`ALTER TABLE "Groups" DROP CONSTRAINT "FK_9f7abc33c76411bf99f9e3474fb"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP CONSTRAINT "FK_693638072af3ebd7b1c8d944993"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP CONSTRAINT "FK_d1ee53034c4424ff52960d8c746"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP CONSTRAINT "FK_0fe0c8fe001f97079be532dd78b"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_cb5b2af873dd015294051fd395"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_9f7abc33c76411bf99f9e3474f"`)
    await queryRunner.query(`DROP TABLE "Groups"`)
    await queryRunner.query(`DROP INDEX "public"."CourseMembers_group_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."CourseMembers_course_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_67b5aca86c71e51fe125dd96eb"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_c29cd877bcaa59bb781bbd426d"`)
    await queryRunner.query(`DROP TABLE "CourseMembers"`)
    await queryRunner.query(`DROP INDEX "public"."UserGroups_name_idx"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bdd234c9d0546c66d5258427a8"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3aee2a43a2b66011304b529055"`)
    await queryRunner.query(`DROP TABLE "UserGroups"`)
  }
}
