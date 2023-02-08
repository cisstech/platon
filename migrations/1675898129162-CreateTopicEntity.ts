import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTopicEntity1675898129162 implements MigrationInterface {
    name = 'CreateTopicEntity1675898129162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Topics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_1ef7dd03abee738fa3199b5134d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Topics"`);
    }

}
