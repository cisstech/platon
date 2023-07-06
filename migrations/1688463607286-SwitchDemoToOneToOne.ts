import { MigrationInterface, QueryRunner } from "typeorm";

export class SwitchDemoToOneToOne1688463607286 implements MigrationInterface {
    name = 'SwitchDemoToOneToOne1688463607286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CourseDemos" DROP CONSTRAINT "FK_607aec97c2683dd298b505f0a9c"`);
        await queryRunner.query(`ALTER TABLE "CourseDemos" ADD CONSTRAINT "UQ_607aec97c2683dd298b505f0a9c" UNIQUE ("course_id")`);
        await queryRunner.query(`ALTER TABLE "CourseDemos" ADD CONSTRAINT "FK_607aec97c2683dd298b505f0a9c" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "CourseDemos" DROP CONSTRAINT "FK_607aec97c2683dd298b505f0a9c"`);
        await queryRunner.query(`ALTER TABLE "CourseDemos" DROP CONSTRAINT "UQ_607aec97c2683dd298b505f0a9c"`);
        await queryRunner.query(`ALTER TABLE "CourseDemos" ADD CONSTRAINT "FK_607aec97c2683dd298b505f0a9c" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
