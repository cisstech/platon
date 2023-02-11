import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserPrefsEntity1676121031895 implements MigrationInterface {
    name = 'CreateUserPrefsEntity1676121031895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "UserPrefs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "REL_72085e53d2fe43668d3f38d3f1" UNIQUE ("user_id"), CONSTRAINT "PK_63e8f376b4fa1480e571c4f3446" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_prefs_levels_levels" ("userPrefsId" uuid NOT NULL, "levelsId" uuid NOT NULL, CONSTRAINT "PK_8e6bd4ec66dd2fd1c73513200a7" PRIMARY KEY ("userPrefsId", "levelsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bbe2ca2b333fe1af9fae5535c1" ON "user_prefs_levels_levels" ("userPrefsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_35826b3cb21e1770efac5f9600" ON "user_prefs_levels_levels" ("levelsId") `);
        await queryRunner.query(`CREATE TABLE "user_prefs_topics_topics" ("userPrefsId" uuid NOT NULL, "topicsId" uuid NOT NULL, CONSTRAINT "PK_115290a55139b91aeb9d1b6e86d" PRIMARY KEY ("userPrefsId", "topicsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3b9a298ef4e0a4e434043810dc" ON "user_prefs_topics_topics" ("userPrefsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_512d5d9052c8e4c4470f16e32f" ON "user_prefs_topics_topics" ("topicsId") `);
        await queryRunner.query(`ALTER TABLE "UserPrefs" ADD CONSTRAINT "FK_72085e53d2fe43668d3f38d3f1f" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_prefs_levels_levels" ADD CONSTRAINT "FK_bbe2ca2b333fe1af9fae5535c18" FOREIGN KEY ("userPrefsId") REFERENCES "UserPrefs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_prefs_levels_levels" ADD CONSTRAINT "FK_35826b3cb21e1770efac5f96008" FOREIGN KEY ("levelsId") REFERENCES "Levels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_prefs_topics_topics" ADD CONSTRAINT "FK_3b9a298ef4e0a4e434043810dca" FOREIGN KEY ("userPrefsId") REFERENCES "UserPrefs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_prefs_topics_topics" ADD CONSTRAINT "FK_512d5d9052c8e4c4470f16e32f0" FOREIGN KEY ("topicsId") REFERENCES "Topics"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_prefs_topics_topics" DROP CONSTRAINT "FK_512d5d9052c8e4c4470f16e32f0"`);
        await queryRunner.query(`ALTER TABLE "user_prefs_topics_topics" DROP CONSTRAINT "FK_3b9a298ef4e0a4e434043810dca"`);
        await queryRunner.query(`ALTER TABLE "user_prefs_levels_levels" DROP CONSTRAINT "FK_35826b3cb21e1770efac5f96008"`);
        await queryRunner.query(`ALTER TABLE "user_prefs_levels_levels" DROP CONSTRAINT "FK_bbe2ca2b333fe1af9fae5535c18"`);
        await queryRunner.query(`ALTER TABLE "UserPrefs" DROP CONSTRAINT "FK_72085e53d2fe43668d3f38d3f1f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_512d5d9052c8e4c4470f16e32f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3b9a298ef4e0a4e434043810dc"`);
        await queryRunner.query(`DROP TABLE "user_prefs_topics_topics"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_35826b3cb21e1770efac5f9600"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bbe2ca2b333fe1af9fae5535c1"`);
        await queryRunner.query(`DROP TABLE "user_prefs_levels_levels"`);
        await queryRunner.query(`DROP TABLE "UserPrefs"`);
    }

}
