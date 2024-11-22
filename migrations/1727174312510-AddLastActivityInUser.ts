import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastActivityInUser1727174312510 implements MigrationInterface {
    name = 'AddLastActivityInUser1727174312510'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ADD "last_activity" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "last_activity"`);
    }

}
