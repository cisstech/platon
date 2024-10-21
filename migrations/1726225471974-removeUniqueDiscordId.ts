import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueDiscordId1726225471974 implements MigrationInterface {
    name = 'RemoveUniqueDiscordId1726225471974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "UQ_c66af78a7ceb3debc34a04eac36"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "UQ_c66af78a7ceb3debc34a04eac36" UNIQUE ("discord_id")`);
    }

}
