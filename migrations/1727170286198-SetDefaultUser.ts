import { MigrationInterface, QueryRunner } from "typeorm";

export class SetDefaultUser1727170286198 implements MigrationInterface {
    name = 'SetDefaultUser1727170286198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_200b6df5e4626a409c34ff439f4"`);
        await queryRunner.query(`ALTER TABLE "Activities" DROP CONSTRAINT "FK_582bc792fe84da567be12511f60"`);
        await queryRunner.query(`ALTER TABLE "ResourceEvents" DROP CONSTRAINT "FK_849b795c276b83abb2036e72f66"`);
        await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP CONSTRAINT "FK_a47597e9cbddc1c574fe4b70d78"`);
        await queryRunner.query(`ALTER TABLE "Corrections" DROP CONSTRAINT "FK_2c2c7673fe8ffbd2b4eb2bd3d2d"`);
        await queryRunner.query(`ALTER TABLE "SessionComments" DROP CONSTRAINT "FK_f9b40f64a0e46f54b27200632d9"`);
        await queryRunner.query(`ALTER TABLE "Resources" ALTER COLUMN "owner_id" SET DEFAULT '00000000-0000-0000-0000-000000000000'`);
        await queryRunner.query(`ALTER TABLE "Activities" ALTER COLUMN "creator_id" SET DEFAULT '00000000-0000-0000-0000-000000000000'`);
        await queryRunner.query(`ALTER TABLE "ResourceEvents" ALTER COLUMN "actor_id" SET DEFAULT '00000000-0000-0000-0000-000000000000'`);
        await queryRunner.query(`ALTER TABLE "ResourceMembers" ALTER COLUMN "inviter_id" SET DEFAULT '00000000-0000-0000-0000-000000000000'`);
        await queryRunner.query(`ALTER TABLE "Corrections" ALTER COLUMN "author_id" SET DEFAULT '00000000-0000-0000-0000-000000000000'`);
        await queryRunner.query(`ALTER TABLE "SessionComments" ALTER COLUMN "author_id" SET DEFAULT '00000000-0000-0000-0000-000000000000'`);
        await queryRunner.query(`ALTER TABLE "Resources" ADD CONSTRAINT "FK_200b6df5e4626a409c34ff439f4" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Activities" ADD CONSTRAINT "FK_582bc792fe84da567be12511f60" FOREIGN KEY ("creator_id") REFERENCES "Users"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceEvents" ADD CONSTRAINT "FK_849b795c276b83abb2036e72f66" FOREIGN KEY ("actor_id") REFERENCES "Users"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceMembers" ADD CONSTRAINT "FK_a47597e9cbddc1c574fe4b70d78" FOREIGN KEY ("inviter_id") REFERENCES "Users"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Corrections" ADD CONSTRAINT "FK_2c2c7673fe8ffbd2b4eb2bd3d2d" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "SessionComments" ADD CONSTRAINT "FK_f9b40f64a0e46f54b27200632d9" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "SessionComments" DROP CONSTRAINT "FK_f9b40f64a0e46f54b27200632d9"`);
        await queryRunner.query(`ALTER TABLE "Corrections" DROP CONSTRAINT "FK_2c2c7673fe8ffbd2b4eb2bd3d2d"`);
        await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP CONSTRAINT "FK_a47597e9cbddc1c574fe4b70d78"`);
        await queryRunner.query(`ALTER TABLE "ResourceEvents" DROP CONSTRAINT "FK_849b795c276b83abb2036e72f66"`);
        await queryRunner.query(`ALTER TABLE "Activities" DROP CONSTRAINT "FK_582bc792fe84da567be12511f60"`);
        await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_200b6df5e4626a409c34ff439f4"`);
        await queryRunner.query(`ALTER TABLE "SessionComments" ALTER COLUMN "author_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "Corrections" ALTER COLUMN "author_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "ResourceMembers" ALTER COLUMN "inviter_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "ResourceEvents" ALTER COLUMN "actor_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "Activities" ALTER COLUMN "creator_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "Resources" ALTER COLUMN "owner_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "SessionComments" ADD CONSTRAINT "FK_f9b40f64a0e46f54b27200632d9" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Corrections" ADD CONSTRAINT "FK_2c2c7673fe8ffbd2b4eb2bd3d2d" FOREIGN KEY ("author_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceMembers" ADD CONSTRAINT "FK_a47597e9cbddc1c574fe4b70d78" FOREIGN KEY ("inviter_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceEvents" ADD CONSTRAINT "FK_849b795c276b83abb2036e72f66" FOREIGN KEY ("actor_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Activities" ADD CONSTRAINT "FK_582bc792fe84da567be12511f60" FOREIGN KEY ("creator_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Resources" ADD CONSTRAINT "FK_200b6df5e4626a409c34ff439f4" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
