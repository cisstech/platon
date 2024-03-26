import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWatchedChallenges1710771775077 implements MigrationInterface {
    name = 'AddWatchedChallenges1710771775077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "WatchedChallenges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "challengeId" character varying NOT NULL, "channel_id" character varying NOT NULL, CONSTRAINT "PK_6d9d6895be7a4ae9c70986da47b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_280447c73028c19fcb2fc160b8" ON "WatchedChallenges" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_2322f6d3f2477689c850e16010" ON "WatchedChallenges" ("updated_at") `);
        await queryRunner.query(`CREATE INDEX "Channel_idx" ON "WatchedChallenges" ("channel_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."Channel_idx"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2322f6d3f2477689c850e16010"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_280447c73028c19fcb2fc160b8"`);
        await queryRunner.query(`DROP TABLE "WatchedChallenges"`);
    }

}
