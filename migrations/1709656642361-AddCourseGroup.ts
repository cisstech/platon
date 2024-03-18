import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCourseGroup1709656642361 implements MigrationInterface {
    name = 'AddCourseGroup1709656642361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "CourseGroupsMember" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "group_id" character varying NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "Unique_CourseGroupMember" UNIQUE ("group_id", "user_id"), CONSTRAINT "PK_cf0de88a14e570fff931969e9ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a9e03a5ae66301845111f87f84" ON "CourseGroupsMember" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_f12275def93c77456bcfc9cd5a" ON "CourseGroupsMember" ("updated_at") `);
        await queryRunner.query(`CREATE INDEX "CourseGroups_name_idx" ON "CourseGroupsMember" ("group_id") `);
        await queryRunner.query(`CREATE INDEX "CourseGroups_user_id_idx" ON "CourseGroupsMember" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "CourseGroups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "group_id" character varying NOT NULL, "course_id" uuid NOT NULL, "name" character varying NOT NULL, CONSTRAINT "Unique_CourseGroup" UNIQUE ("group_id", "course_id"), CONSTRAINT "PK_b3aa3d248679dcebeaba047a522" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a17a16e55e5cbcb714133c52c7" ON "CourseGroups" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_a909845c5abb88012164887d30" ON "CourseGroups" ("updated_at") `);
        await queryRunner.query(`CREATE INDEX "CourseGroups_course_id_idx" ON "CourseGroups" ("course_id") `);
        await queryRunner.query(`ALTER TABLE "CourseGroupsMember" ADD CONSTRAINT "FK_c1e9628dfc5d047a76afdc648f6" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "CourseGroups" ADD CONSTRAINT "FK_04723974c64501d04e7dac45298" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CourseGroups" DROP CONSTRAINT "FK_04723974c64501d04e7dac45298"`);
        await queryRunner.query(`ALTER TABLE "CourseGroupsMember" DROP CONSTRAINT "FK_c1e9628dfc5d047a76afdc648f6"`);
        await queryRunner.query(`DROP INDEX "public"."CourseGroups_course_id_idx"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a909845c5abb88012164887d30"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a17a16e55e5cbcb714133c52c7"`);
        await queryRunner.query(`DROP TABLE "CourseGroups"`);
        await queryRunner.query(`DROP INDEX "public"."CourseGroups_user_id_idx"`);
        await queryRunner.query(`DROP INDEX "public"."CourseGroups_name_idx"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f12275def93c77456bcfc9cd5a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9e03a5ae66301845111f87f84"`);
        await queryRunner.query(`DROP TABLE "CourseGroupsMember"`);
    }

}
