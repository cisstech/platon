import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsChallengeColumnOnActivities1707174364866 implements MigrationInterface {
  name = 'AddIsChallengeColumnOnActivities1707174364866'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Activities" ADD "is_challenge" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`CREATE INDEX "Activities_is_challenge_idx" ON "Activities" ("is_challenge") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."Activities_is_challenge_idx"`);
    await queryRunner.query(`ALTER TABLE "Activities" DROP COLUMN "is_challenge"`);
  }

}
