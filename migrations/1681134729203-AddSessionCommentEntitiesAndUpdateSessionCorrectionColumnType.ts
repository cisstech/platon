import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSessionCommentEntitiesAndUpdateSessionCorrectionColumnType1681134729203 implements MigrationInterface {
  name = 'AddSessionCommentEntitiesAndUpdateSessionCorrectionColumnType1681134729203'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Sessions" RENAME COLUMN "correction" TO "correction_id"`)
    await queryRunner.query(
      `CREATE TABLE "Corrections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "author_id" uuid NOT NULL, "grade" double precision NOT NULL, CONSTRAINT "PK_8f5ad3277a14b403c893dbee0d7" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_4e0655114fd989e16947e760b0" ON "Corrections" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_ee1df9539b7bff6de4e9340015" ON "Corrections" ("updated_at") `)
    await queryRunner.query(
      `CREATE TABLE "SessionComments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "author_id" uuid NOT NULL, "session_id" uuid NOT NULL, "answer_id" uuid NOT NULL, "comment" text NOT NULL, CONSTRAINT "PK_2fcbeaa113ab9a6935731bf444b" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_dd2adc77f27f0e4ea65f39408e" ON "SessionComments" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_6e35d03db1940f7cff6213c81e" ON "SessionComments" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "SessionComments_session_id_idx" ON "SessionComments" ("session_id") `)
    await queryRunner.query(`CREATE INDEX "SessionComments_answer_id_idx" ON "SessionComments" ("answer_id") `)
    await queryRunner.query(
      `CREATE INDEX "SessionComments_session_id_answer_id_idx" ON "SessionComments" ("session_id", "answer_id") `
    )
    await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "correction_id"`)
    await queryRunner.query(`ALTER TABLE "Sessions" ADD "correction_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "Corrections" ADD CONSTRAINT "FK_2c2c7673fe8ffbd2b4eb2bd3d2d" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "Sessions" ADD CONSTRAINT "FK_1a297633a424659cfacef3fd74b" FOREIGN KEY ("correction_id") REFERENCES "Corrections"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "SessionComments" ADD CONSTRAINT "FK_f9b40f64a0e46f54b27200632d9" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "SessionComments" ADD CONSTRAINT "FK_5d9481cc272ef0cec6f3d38df22" FOREIGN KEY ("session_id") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "SessionComments" ADD CONSTRAINT "FK_f48162f91074d0d34a99acba93a" FOREIGN KEY ("answer_id") REFERENCES "Answers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "SessionComments" DROP CONSTRAINT "FK_f48162f91074d0d34a99acba93a"`)
    await queryRunner.query(`ALTER TABLE "SessionComments" DROP CONSTRAINT "FK_5d9481cc272ef0cec6f3d38df22"`)
    await queryRunner.query(`ALTER TABLE "SessionComments" DROP CONSTRAINT "FK_f9b40f64a0e46f54b27200632d9"`)
    await queryRunner.query(`ALTER TABLE "Sessions" DROP CONSTRAINT "FK_1a297633a424659cfacef3fd74b"`)
    await queryRunner.query(`ALTER TABLE "Corrections" DROP CONSTRAINT "FK_2c2c7673fe8ffbd2b4eb2bd3d2d"`)
    await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "correction_id"`)
    await queryRunner.query(`ALTER TABLE "Sessions" ADD "correction_id" double precision`)
    await queryRunner.query(`DROP INDEX "public"."SessionComments_session_id_answer_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."SessionComments_answer_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."SessionComments_session_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6e35d03db1940f7cff6213c81e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_dd2adc77f27f0e4ea65f39408e"`)
    await queryRunner.query(`DROP TABLE "SessionComments"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ee1df9539b7bff6de4e9340015"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_4e0655114fd989e16947e760b0"`)
    await queryRunner.query(`DROP TABLE "Corrections"`)
    await queryRunner.query(`ALTER TABLE "Sessions" RENAME COLUMN "correction_id" TO "correction"`)
  }
}
