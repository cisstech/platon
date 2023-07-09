import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdatePlayerSesssionIndexes1678136391504 implements MigrationInterface {
  name = 'UpdatePlayerSesssionIndexes1678136391504'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" DROP CONSTRAINT "PlayerSessions_activity_idx"`
    )
    await queryRunner.query(
      `CREATE INDEX "PlayerSessions_activity_user_idx" ON "PlayerSessions" ("parent_id", "course_activity_id", "user_id") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."PlayerSessions_activity_user_idx"`)
    await queryRunner.query(
      `ALTER TABLE "PlayerSessions" ADD CONSTRAINT "PlayerSessions_activity_idx" UNIQUE ("user_id", "course_activity_id")`
    )
  }
}
