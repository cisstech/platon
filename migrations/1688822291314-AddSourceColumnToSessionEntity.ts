import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourceColumnToSessionEntity1688822291314 implements MigrationInterface {
    name = 'AddSourceColumnToSessionEntity1688822291314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Sessions" ADD "source" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "source"`);
    }

}
