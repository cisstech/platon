import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveNoneFromResourceStatus1676118556653 implements MigrationInterface {
    name = 'RemoveNoneFromResourceStatus1676118556653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."Resources_type_enum" AS ENUM('CIRCLE', 'EXERCISE', 'ACTIVITY')`);
        await queryRunner.query(`ALTER TABLE "Resources" ADD "type" "public"."Resources_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "visibility"`);
        await queryRunner.query(`CREATE TYPE "public"."Resources_visibility_enum" AS ENUM('PUBLIC', 'PRIVATE', 'PERSONAL')`);
        await queryRunner.query(`ALTER TABLE "Resources" ADD "visibility" "public"."Resources_visibility_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."Resources_status_enum" AS ENUM('READY', 'DEPRECATED', 'BUGGED', 'NOT_TESTED', 'DRAFT')`);
        await queryRunner.query(`ALTER TABLE "Resources" ADD "status" "public"."Resources_status_enum" NOT NULL DEFAULT 'READY'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."Resources_status_enum"`);
        await queryRunner.query(`ALTER TABLE "Resources" ADD "status" character varying NOT NULL DEFAULT 'NONE'`);
        await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "visibility"`);
        await queryRunner.query(`DROP TYPE "public"."Resources_visibility_enum"`);
        await queryRunner.query(`ALTER TABLE "Resources" ADD "visibility" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."Resources_type_enum"`);
        await queryRunner.query(`ALTER TABLE "Resources" ADD "type" character varying NOT NULL`);
    }

}
