import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPlayerAndCourseEntities1677424166027 implements MigrationInterface {
  name = 'AddPlayerAndCourseEntities1677424166027'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "desc" character varying, "owner_id" uuid, CONSTRAINT "PK_e01ce00d3984a78d0693ab3ecbe" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_198b064b094080f5d97672938c" ON "Courses" ("created_at") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_6739ae395b173d6711c22ea9a3" ON "Courses" ("updated_at") `
    )
    await queryRunner.query(`CREATE INDEX "Courses_name_idx" ON "Courses" (f_unaccent(name)) `)
    await queryRunner.query(`CREATE INDEX "Courses_owner_id_idx" ON "Courses" ("owner_id") `)
    await queryRunner.query(
      `CREATE TABLE "CourseSections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "order" integer NOT NULL, "desc" character varying, "course_id" uuid NOT NULL, CONSTRAINT "PK_42983e1827ad1801f33247523ef" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_8eb572e931ed6500241d826ac9" ON "CourseSections" ("created_at") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_e20a1df2c53aa44a5a0e3601b8" ON "CourseSections" ("updated_at") `
    )
    await queryRunner.query(
      `CREATE INDEX "CourseSections_course_id_idx" ON "CourseSections" ("course_id") `
    )
    await queryRunner.query(
      `CREATE TABLE "CourseActivities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "order" integer NOT NULL, "course_id" uuid NOT NULL, "section_id" uuid NOT NULL, "resource_id" uuid NOT NULL, "resource_version" character varying NOT NULL, CONSTRAINT "PK_751aac83e5656911762ca8dc938" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_263c90ba20a8969e9824b5b886" ON "CourseActivities" ("created_at") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_2360a6b95cc92fdc481420a533" ON "CourseActivities" ("updated_at") `
    )
    await queryRunner.query(
      `CREATE INDEX "CourseActivities_course_id_idx" ON "CourseActivities" ("course_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "CourseActivities_section_idx" ON "CourseActivities" ("course_id", "section_id") `
    )
    await queryRunner.query(
      `CREATE TABLE "PlayerSessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "parent_id" uuid, "envid" uuid, "user_id" uuid, "resource_id" uuid, "course_activity_id" uuid, "variables" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PlayerSessions_activity_idx" UNIQUE ("course_activity_id", "user_id"), CONSTRAINT "PK_77e1a7c172f44f01260abd2ab0b" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_a1a3a375fdae27b46fd37b84b8" ON "PlayerSessions" ("created_at") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_c6a46fa9820da4c4b64c56bf64" ON "PlayerSessions" ("updated_at") `
    )
    await queryRunner.query(
      `CREATE INDEX "PlayerSessions_exercise_idx" ON "PlayerSessions" ("parent_id", "id") `
    )
    await queryRunner.query(
      `CREATE TABLE "PlayerAnswers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "session_id" uuid NOT NULL, "answers" jsonb NOT NULL, "grade" integer NOT NULL DEFAULT '-1', CONSTRAINT "PK_1f260d23d8faac71505d6814e2e" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_b45d17931ede632ff5e87a8acc" ON "PlayerAnswers" ("created_at") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_64f70427646221e8fe081bb7c5" ON "PlayerAnswers" ("updated_at") `
    )
    await queryRunner.query(
      `CREATE INDEX "PlayerAnswers_user_id_session_id_idx" ON "PlayerAnswers" ("user_id", "session_id") `
    )
    await queryRunner.query(
      `ALTER TABLE "Courses" ADD CONSTRAINT "FK_c0efa47921b253d65a1e59a89dc" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseSections" ADD CONSTRAINT "FK_dda9033fa0ee0d1c0b93ff41bfb" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseActivities" ADD CONSTRAINT "FK_ed4202cad95e7d0e59d5ce6ff02" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseActivities" ADD CONSTRAINT "FK_01966ce4d5121abe9070e9ad967" FOREIGN KEY ("section_id") REFERENCES "CourseSections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseActivities" ADD CONSTRAINT "FK_4664fe280a7a38550be4e43dd31" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" ADD CONSTRAINT "FK_e55badaaa4a01cff2072c771c31" FOREIGN KEY ("parent_id") REFERENCES "PlayerSessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" ADD CONSTRAINT "FK_c7229d8b0459942a85b6facdc49" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" ADD CONSTRAINT "FK_dddb0e7d2b4f07a7a3368c87601" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" ADD CONSTRAINT "FK_1aeb8ab354c33789f9b124afca4" FOREIGN KEY ("course_activity_id") REFERENCES "CourseActivities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerAnswers" ADD CONSTRAINT "FK_ab41c3962450014839a14594030" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerAnswers" ADD CONSTRAINT "FK_d66b273364e95789d94305d2529" FOREIGN KEY ("session_id") REFERENCES "PlayerSessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PlayerAnswers" DROP CONSTRAINT "FK_d66b273364e95789d94305d2529"`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerAnswers" DROP CONSTRAINT "FK_ab41c3962450014839a14594030"`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" DROP CONSTRAINT "FK_1aeb8ab354c33789f9b124afca4"`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" DROP CONSTRAINT "FK_dddb0e7d2b4f07a7a3368c87601"`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" DROP CONSTRAINT "FK_c7229d8b0459942a85b6facdc49"`
    )
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" DROP CONSTRAINT "FK_e55badaaa4a01cff2072c771c31"`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseActivities" DROP CONSTRAINT "FK_4664fe280a7a38550be4e43dd31"`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseActivities" DROP CONSTRAINT "FK_01966ce4d5121abe9070e9ad967"`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseActivities" DROP CONSTRAINT "FK_ed4202cad95e7d0e59d5ce6ff02"`
    )
    await queryRunner.query(
      `ALTER TABLE "CourseSections" DROP CONSTRAINT "FK_dda9033fa0ee0d1c0b93ff41bfb"`
    )
    await queryRunner.query(
      `ALTER TABLE "Courses" DROP CONSTRAINT "FK_c0efa47921b253d65a1e59a89dc"`
    )
    await queryRunner.query(`DROP INDEX "public"."PlayerAnswers_user_id_session_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_64f70427646221e8fe081bb7c5"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_b45d17931ede632ff5e87a8acc"`)
    await queryRunner.query(`DROP TABLE "PlayerAnswers"`)
    await queryRunner.query(`DROP INDEX "public"."PlayerSessions_exercise_idx"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_c6a46fa9820da4c4b64c56bf64"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_a1a3a375fdae27b46fd37b84b8"`)
    await queryRunner.query(`DROP TABLE "PlayerSessions"`)
    await queryRunner.query(`DROP INDEX "public"."CourseActivities_section_idx"`)
    await queryRunner.query(`DROP INDEX "public"."CourseActivities_course_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_2360a6b95cc92fdc481420a533"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_263c90ba20a8969e9824b5b886"`)
    await queryRunner.query(`DROP TABLE "CourseActivities"`)
    await queryRunner.query(`DROP INDEX "public"."CourseSections_course_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e20a1df2c53aa44a5a0e3601b8"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_8eb572e931ed6500241d826ac9"`)
    await queryRunner.query(`DROP TABLE "CourseSections"`)
    await queryRunner.query(`DROP INDEX "public"."Courses_owner_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."Courses_name_idx"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6739ae395b173d6711c22ea9a3"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_198b064b094080f5d97672938c"`)
    await queryRunner.query(`DROP TABLE "Courses"`)
  }
}
