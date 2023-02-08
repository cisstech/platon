import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLevelEntity1675898535792 implements MigrationInterface {
    name = 'CreateLevelEntity1675898535792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Levels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_18322e8ea03ecac3d45160cb96d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Levels"`);
    }

}
