import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserEntity1675284608960 implements MigrationInterface {
    name = 'CreateUserEntity1675284608960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Users_role_enum" AS ENUM('admin', 'teacher', 'student')`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "first_name" character varying NOT NULL DEFAULT '', "last_name" character varying NOT NULL DEFAULT '', "active" boolean NOT NULL DEFAULT true, "role" "public"."Users_role_enum" NOT NULL, "email" character varying, "password" character varying, "last_login" TIMESTAMP WITH TIME ZONE, "first_login" TIMESTAMP WITH TIME ZONE, CONSTRAINT "Users_unique_idx" UNIQUE ("username"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TYPE "public"."Users_role_enum"`);
    }

}
