import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLtiEntities1675554462127 implements MigrationInterface {
    name = 'CreateLtiEntities1675554462127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Lmses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "url" character varying NOT NULL, "outcome_url" character varying NOT NULL, "consumer_key" character varying NOT NULL, "consumer_secret" character varying NOT NULL, CONSTRAINT "Lmses_unique_idx" UNIQUE ("consumer_key"), CONSTRAINT "PK_fda92ed08b62cd0e2f69fc03c67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "LmsUsers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lms_user_id" character varying NOT NULL, "lms_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "LmsUsers_unique_idx" UNIQUE ("lms_id", "lms_user_id", "user_id"), CONSTRAINT "PK_2f524117e5a571ca8149dfab28c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "LmsUsers" ADD CONSTRAINT "FK_f54bf115485bb640e184edda955" FOREIGN KEY ("lms_id") REFERENCES "Lmses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "LmsUsers" ADD CONSTRAINT "FK_8aac849edd33180c080cfddd9eb" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "LmsUsers" DROP CONSTRAINT "FK_8aac849edd33180c080cfddd9eb"`);
        await queryRunner.query(`ALTER TABLE "LmsUsers" DROP CONSTRAINT "FK_f54bf115485bb640e184edda955"`);
        await queryRunner.query(`DROP TABLE "LmsUsers"`);
        await queryRunner.query(`DROP TABLE "Lmses"`);
    }

}
