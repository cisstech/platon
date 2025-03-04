import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDiscordInvitation1725611506699 implements MigrationInterface {
    name = 'AddDiscordInvitation1725611506699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "DiscordInvitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "invitation" character varying NOT NULL, "date" TIMESTAMP NOT NULL, CONSTRAINT "REL_7769fa4b4c7af490ee4c9f04d7" UNIQUE ("user_id"), CONSTRAINT "PK_811c4f36dadf20ae2f1cb0c9102" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_14474346c0639d928b31babee9" ON "DiscordInvitation" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_bbc227d7c160c4dc4ac8fe670a" ON "DiscordInvitation" ("updated_at") `);
        await queryRunner.query(`ALTER TABLE "DiscordInvitation" ADD CONSTRAINT "FK_7769fa4b4c7af490ee4c9f04d7f" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DiscordInvitation" DROP CONSTRAINT "FK_7769fa4b4c7af490ee4c9f04d7f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bbc227d7c160c4dc4ac8fe670a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_14474346c0639d928b31babee9"`);
        await queryRunner.query(`DROP TABLE "DiscordInvitation"`);
    }

}
