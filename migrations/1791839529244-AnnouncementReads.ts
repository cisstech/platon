import { MigrationInterface, QueryRunner } from "typeorm";

export class AnnouncementReads1791839529244 implements MigrationInterface {
    name = 'AnnouncementReads1791839529244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "AnnouncementReads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "announcement_id" uuid NOT NULL, CONSTRAINT "AnnouncementReads_unique_idx" UNIQUE ("user_id", "announcement_id"), CONSTRAINT "PK_4e639cc3439dbc887d60b1d2402" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4a4c01764e4f8e70472b0612b6" ON "AnnouncementReads" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_6a9c79f448d08bd3bf481598d2" ON "AnnouncementReads" ("updated_at") `);
        await queryRunner.query(`CREATE INDEX "AnnouncementReads_announcement_id_idx" ON "AnnouncementReads" ("announcement_id") `);
        await queryRunner.query(`ALTER TABLE "AnnouncementReads" ADD CONSTRAINT "FK_1b9823fc960aa89cb509772f043" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "AnnouncementReads" ADD CONSTRAINT "FK_2d7dba561d95beaddfc8df54a88" FOREIGN KEY ("announcement_id") REFERENCES "Announcements"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "AnnouncementReads" DROP CONSTRAINT "FK_2d7dba561d95beaddfc8df54a88"`);
        await queryRunner.query(`ALTER TABLE "AnnouncementReads" DROP CONSTRAINT "FK_1b9823fc960aa89cb509772f043"`);
        await queryRunner.query(`DROP INDEX "public"."AnnouncementReads_announcement_id_idx"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6a9c79f448d08bd3bf481598d2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4a4c01764e4f8e70472b0612b6"`);
        await queryRunner.query(`DROP TABLE "AnnouncementReads"`);
    }

}
