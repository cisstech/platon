import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddingCAS1702035237844 implements MigrationInterface {
  name = 'AddingCAS1702035237844'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."Cas_version_enum" AS ENUM('1.0', '2.0', '3.0', 'saml1.1')`)
    await queryRunner.query(
      `CREATE TABLE "Cas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "login_url" character varying NOT NULL, "service_validate_url" character varying NOT NULL, "version" "public"."Cas_version_enum" NOT NULL DEFAULT '3.0', CONSTRAINT "UQ_df37e9a08a02480a9ba32ae935d" UNIQUE ("name"), CONSTRAINT "UQ_173395d2b366d0df6a0ba5749f0" UNIQUE ("login_url"), CONSTRAINT "UQ_eda6c6198d511bb91f1f39f313b" UNIQUE ("service_validate_url"), CONSTRAINT "PK_6bf59c38653b626649131566dd7" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_550ada710d71fd26f79b511656" ON "Cas" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_284a094d599b5071d6678ad865" ON "Cas" ("updated_at") `)
    await queryRunner.query(
      `CREATE TABLE "cas_lmses_lmses" ("casId" uuid NOT NULL, "lmsesId" uuid NOT NULL, CONSTRAINT "PK_dd6fc32410fbd043fac48584a7a" PRIMARY KEY ("casId", "lmsesId"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_6a4d078fbdda07b2c998b7d733" ON "cas_lmses_lmses" ("casId") `)
    await queryRunner.query(`CREATE INDEX "IDX_e0f5c84b53f74b7c63ec0b2eff" ON "cas_lmses_lmses" ("lmsesId") `)
    await queryRunner.query(`ALTER TABLE "LmsUsers" ADD "username" character varying`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bc64a73db01a49cb9e24baef7a"`)
    await queryRunner.query(`ALTER TABLE "CourseDemos" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "CourseDemos" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_448c581a0cf05983e4ef33aa96"`)
    await queryRunner.query(`ALTER TABLE "CourseDemos" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "CourseDemos" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`CREATE INDEX "IDX_bc64a73db01a49cb9e24baef7a" ON "CourseDemos" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_448c581a0cf05983e4ef33aa96" ON "CourseDemos" ("updated_at") `)
    await queryRunner.query(
      `ALTER TABLE "cas_lmses_lmses" ADD CONSTRAINT "FK_6a4d078fbdda07b2c998b7d7331" FOREIGN KEY ("casId") REFERENCES "Cas"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "cas_lmses_lmses" ADD CONSTRAINT "FK_e0f5c84b53f74b7c63ec0b2efff" FOREIGN KEY ("lmsesId") REFERENCES "Lmses"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cas_lmses_lmses" DROP CONSTRAINT "FK_e0f5c84b53f74b7c63ec0b2efff"`)
    await queryRunner.query(`ALTER TABLE "cas_lmses_lmses" DROP CONSTRAINT "FK_6a4d078fbdda07b2c998b7d7331"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_448c581a0cf05983e4ef33aa96"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bc64a73db01a49cb9e24baef7a"`)
    await queryRunner.query(`ALTER TABLE "CourseDemos" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "CourseDemos" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_448c581a0cf05983e4ef33aa96" ON "CourseDemos" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "CourseDemos" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "CourseDemos" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_bc64a73db01a49cb9e24baef7a" ON "CourseDemos" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "LmsUsers" DROP COLUMN "username"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e0f5c84b53f74b7c63ec0b2eff"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6a4d078fbdda07b2c998b7d733"`)
    await queryRunner.query(`DROP TABLE "cas_lmses_lmses"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_284a094d599b5071d6678ad865"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_550ada710d71fd26f79b511656"`)
    await queryRunner.query(`DROP TABLE "Cas"`)
    await queryRunner.query(`DROP TYPE "public"."Cas_version_enum"`)
  }
}
