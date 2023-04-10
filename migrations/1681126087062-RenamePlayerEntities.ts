import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamePlayerEntities1681126087062 implements MigrationInterface {
  name = 'RenamePlayerEntities1681126087062'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "Sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "parent_id" uuid, "envid" uuid, "user_id" uuid, "activity_id" uuid, "variables" jsonb NOT NULL DEFAULT '{}', "grade" double precision NOT NULL DEFAULT '-1', "correction" double precision, "attempts" integer NOT NULL DEFAULT '0', "started_at" TIMESTAMP WITH TIME ZONE, "last_graded_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0ff5532d98863bc618809d2d401" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_be5f37e440062ddaff050b98d1" ON "Sessions" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_4a05eb8345db2ef39dd57ebbbc" ON "Sessions" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "Sessions_activity_user_idx" ON "Sessions" ("parent_id", "activity_id", "user_id") `);
    await queryRunner.query(`CREATE INDEX "Sessions_exercise_idx" ON "Sessions" ("parent_id", "id") `);
    await queryRunner.query(`CREATE TABLE "Answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "session_id" uuid NOT NULL, "variables" jsonb NOT NULL, "grade" double precision NOT NULL DEFAULT '-1', CONSTRAINT "PK_e9ce77a9a6326d042fc833d63f5" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_0f28a257f8103ede2eb418be0d" ON "Answers" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_ba50dbd5a1494d54b91fe1e65e" ON "Answers" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "Answers_session_id_idx" ON "Answers" ("session_id") `);
    await queryRunner.query(`CREATE INDEX "Answers_user_id_session_id_idx" ON "Answers" ("user_id", "session_id") `);
    await queryRunner.query(`ALTER TABLE "Sessions" ADD CONSTRAINT "FK_8e111c6261cb04b3a007d3769de" FOREIGN KEY ("parent_id") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "Sessions" ADD CONSTRAINT "FK_28c544a997944cf3bb6f09e9d5e" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "Sessions" ADD CONSTRAINT "FK_e14369a3cbfc1c2fe95999c7cc3" FOREIGN KEY ("activity_id") REFERENCES "Activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "Answers" ADD CONSTRAINT "FK_83302fe61496a2ac9f7597bde08" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "Answers" ADD CONSTRAINT "FK_f4b1b81c632ab1bff141562b98f" FOREIGN KEY ("session_id") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

    await queryRunner.query(`DROP TABLE "PlayerAnswers"`);
    await queryRunner.query(`DROP TABLE "PlayerSessions"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Answers" DROP CONSTRAINT "FK_f4b1b81c632ab1bff141562b98f"`);
    await queryRunner.query(`ALTER TABLE "Answers" DROP CONSTRAINT "FK_83302fe61496a2ac9f7597bde08"`);
    await queryRunner.query(`ALTER TABLE "Sessions" DROP CONSTRAINT "FK_e14369a3cbfc1c2fe95999c7cc3"`);
    await queryRunner.query(`ALTER TABLE "Sessions" DROP CONSTRAINT "FK_28c544a997944cf3bb6f09e9d5e"`);
    await queryRunner.query(`ALTER TABLE "Sessions" DROP CONSTRAINT "FK_8e111c6261cb04b3a007d3769de"`);
    await queryRunner.query(`DROP INDEX "public"."Answers_user_id_session_id_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Answers_session_id_idx"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ba50dbd5a1494d54b91fe1e65e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0f28a257f8103ede2eb418be0d"`);
    await queryRunner.query(`DROP TABLE "Answers"`);
    await queryRunner.query(`DROP INDEX "public"."Sessions_exercise_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Sessions_activity_user_idx"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4a05eb8345db2ef39dd57ebbbc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_be5f37e440062ddaff050b98d1"`);
    await queryRunner.query(`DROP TABLE "Sessions"`);
  }

}
