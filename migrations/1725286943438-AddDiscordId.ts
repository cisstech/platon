import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDiscordId1725286943438 implements MigrationInterface {
    name = 'AddDiscordId1725286943438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ADD "discord_id" character varying`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "UQ_c66af78a7ceb3debc34a04eac36" UNIQUE ("discord_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "UQ_c66af78a7ceb3debc34a04eac36"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "discord_id"`);
    }

}
