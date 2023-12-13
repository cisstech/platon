import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSessionIsBuilt1702474651768 implements MigrationInterface {
    name = 'AddSessionIsBuilt1702474651768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Sessions" ADD "is_built" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "is_built"`);
    }

}
