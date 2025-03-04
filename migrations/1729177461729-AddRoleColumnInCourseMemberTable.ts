import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleColumnInCourseMemberTable1729177461729 implements MigrationInterface {
    name = 'AddRoleColumnInCourseMemberTable1729177461729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."CourseMembers_role_enum" AS ENUM('student', 'teacher')`);
        await queryRunner.query(`ALTER TABLE "CourseMembers" ADD "role" "public"."CourseMembers_role_enum" NOT NULL DEFAULT 'student'`);
        // By default, existing members should have the role 'student' user role is student or 'teacher' is user is admin or teacher
        await queryRunner.query(`
            UPDATE "CourseMembers" cm
            SET "role" = CASE
                WHEN u.role IN ('teacher', 'admin') THEN 'teacher'::"public"."CourseMembers_role_enum"
                ELSE 'student'::"public"."CourseMembers_role_enum"
            END
            FROM "Users" u
            WHERE cm.user_id = u.id
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CourseMembers" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."CourseMembers_role_enum"`);
    }

}
