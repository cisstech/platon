import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNotificationEntity1682262587316 implements MigrationInterface {
  name = 'AddNotificationEntity1682262587316'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "read_at" TIMESTAMP WITH TIME ZONE, "data" jsonb NOT NULL, CONSTRAINT "PK_c77268afe7d3c5568da66c5bebe" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_25d354306e232a47a9caf2c844" ON "Notifications" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_83a2c61c57d9d6c2cb48dccbf1" ON "Notifications" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "Notifications_user_id_idx" ON "Notifications" ("user_id") `)
    await queryRunner.query(`CREATE INDEX "Notifications_read_at_idx" ON "Notifications" ("read_at") `)
    await queryRunner.query(
      `ALTER TABLE "Notifications" ADD CONSTRAINT "FK_58ecf3b94e7e8f3187e0fd21d6f" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Notifications" DROP CONSTRAINT "FK_58ecf3b94e7e8f3187e0fd21d6f"`)
    await queryRunner.query(`DROP INDEX "public"."Notifications_read_at_idx"`)
    await queryRunner.query(`DROP INDEX "public"."Notifications_user_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_83a2c61c57d9d6c2cb48dccbf1"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_25d354306e232a47a9caf2c844"`)
    await queryRunner.query(`DROP TABLE "Notifications"`)
  }
}
