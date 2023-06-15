import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingDemos1687859244717 implements MigrationInterface {
    name = 'AddingDemos1687859244717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "CourseDemos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "course_id" uuid, CONSTRAINT "PK_63cdbbb54cb880e3444509fbf1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bc64a73db01a49cb9e24baef7a" ON "CourseDemos" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_448c581a0cf05983e4ef33aa96" ON "CourseDemos" ("updated_at") `);
        await queryRunner.query(`ALTER TABLE "CourseDemos" ADD CONSTRAINT "FK_607aec97c2683dd298b505f0a9c" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CourseDemos" DROP CONSTRAINT "FK_607aec97c2683dd298b505f0a9c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_448c581a0cf05983e4ef33aa96"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc64a73db01a49cb9e24baef7a"`);
        await queryRunner.query(`DROP TABLE "CourseDemos"`);
    }

}
