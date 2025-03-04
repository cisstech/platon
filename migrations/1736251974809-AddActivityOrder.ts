import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActivityOrder1736251974809 implements MigrationInterface {
    name = 'AddActivityOrder1736251974809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Activities" ADD "order" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Activities" DROP COLUMN "order"`);
    }

}
