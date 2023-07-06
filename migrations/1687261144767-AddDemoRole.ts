import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDemoRole1687261144767 implements MigrationInterface {
    name = 'AddDemoRole1687261144767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."Users_role_enum" RENAME TO "Users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."Users_role_enum" AS ENUM('admin', 'teacher', 'student', 'demo')`);
        await queryRunner.query(`ALTER TABLE "Users" ALTER COLUMN "role" TYPE "public"."Users_role_enum" USING "role"::"text"::"public"."Users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Users_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Users_role_enum_old" AS ENUM('admin', 'teacher', 'student')`);
        await queryRunner.query(`ALTER TABLE "Users" ALTER COLUMN "role" TYPE "public"."Users_role_enum_old" USING "role"::"text"::"public"."Users_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."Users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."Users_role_enum_old" RENAME TO "Users_role_enum"`);
    }

}
