import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLmsCourseTable1731076413645 implements MigrationInterface {
    name = 'AddLmsCourseTable1731076413645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "LmsCourses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "lms_course_id" character varying NOT NULL, "lms_id" uuid NOT NULL, "course_id" uuid NOT NULL, CONSTRAINT "LmsCourses_unique_idx" UNIQUE ("lms_id", "lms_course_id", "course_id"), CONSTRAINT "PK_7a0c299f4950b7fb8fe70fa55df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_25a19d1c1ea8ef0e4c93e705c6" ON "LmsCourses" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_b04da1c79c50951435ac5a6093" ON "LmsCourses" ("updated_at") `);
        await queryRunner.query(`ALTER TABLE "LmsCourses" ADD CONSTRAINT "FK_bd62dae188db7e2aee5f64c9641" FOREIGN KEY ("lms_id") REFERENCES "Lmses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "LmsCourses" ADD CONSTRAINT "FK_86f3d9b2816100a9782a764de57" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "LmsCourses" DROP CONSTRAINT "FK_86f3d9b2816100a9782a764de57"`);
        await queryRunner.query(`ALTER TABLE "LmsCourses" DROP CONSTRAINT "FK_bd62dae188db7e2aee5f64c9641"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b04da1c79c50951435ac5a6093"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_25a19d1c1ea8ef0e4c93e705c6"`);
        await queryRunner.query(`DROP TABLE "LmsCourses"`);
    }

}
