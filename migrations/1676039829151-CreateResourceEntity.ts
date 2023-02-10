import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResourceEntity1676039829151 implements MigrationInterface {
    name = 'CreateResourceEntity1676039829151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Resources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "desc" character varying, "type" character varying NOT NULL, "visibility" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'NONE', "owner_id" uuid NOT NULL, "parent_id" uuid, CONSTRAINT "PK_cb2d1b1fe8da812b2406657ccfa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ResourceInvitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "inviter_id" uuid NOT NULL, "invitee_id" uuid NOT NULL, "resource_id" uuid NOT NULL, "permissionsRead" boolean NOT NULL DEFAULT true, "permissionsWrite" boolean NOT NULL DEFAULT true, CONSTRAINT "ResourceInvitations_unique_idx" UNIQUE ("inviter_id", "invitee_id", "resource_id"), CONSTRAINT "PK_d5d767eb8a03af0801262f64b9b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ResourceMembers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "resource_id" uuid NOT NULL, "permissionsRead" boolean NOT NULL DEFAULT true, "permissionsWrite" boolean NOT NULL DEFAULT true, CONSTRAINT "ResourceMembers_unique_idx" UNIQUE ("user_id", "resource_id"), CONSTRAINT "PK_4c636a2842d2926060716b74c8f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ResourceEvents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "actor_id" uuid NOT NULL, "resource_id" uuid NOT NULL, "data" jsonb NOT NULL, CONSTRAINT "PK_576000477fde521a8ab09b49939" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ResourceViews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "resource_id" uuid NOT NULL, CONSTRAINT "ResourceViews_unique_idx" UNIQUE ("user_id", "resource_id"), CONSTRAINT "PK_2a9295e1c25d780dc0f0d164bd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "resources_levels_levels" ("resourcesId" uuid NOT NULL, "levelsId" uuid NOT NULL, CONSTRAINT "PK_c4537e93ff61468a0979dd4d8b1" PRIMARY KEY ("resourcesId", "levelsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_76dbf24f79131507986841a625" ON "resources_levels_levels" ("resourcesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_060b2d107b7ef8cba82e7351a4" ON "resources_levels_levels" ("levelsId") `);
        await queryRunner.query(`CREATE TABLE "resources_topics_topics" ("resourcesId" uuid NOT NULL, "topicsId" uuid NOT NULL, CONSTRAINT "PK_1ed3deeab21fafd3887662f0df9" PRIMARY KEY ("resourcesId", "topicsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1c140461e69db9f83a46b95ebc" ON "resources_topics_topics" ("resourcesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_92acaad3cea1894f6fdf34dadf" ON "resources_topics_topics" ("topicsId") `);
        await queryRunner.query(`ALTER TABLE "Resources" ADD CONSTRAINT "FK_200b6df5e4626a409c34ff439f4" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Resources" ADD CONSTRAINT "FK_04788812f73f37dda1257a47188" FOREIGN KEY ("parent_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceInvitations" ADD CONSTRAINT "FK_b0163fcaa15a025dd5da3f73dfb" FOREIGN KEY ("inviter_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceInvitations" ADD CONSTRAINT "FK_8092663f4800cbfb8268f3bc87a" FOREIGN KEY ("invitee_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceInvitations" ADD CONSTRAINT "FK_4e036ec09e73efafbc2b9c9dcfd" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceMembers" ADD CONSTRAINT "FK_c46df0966d90f8f2906f1722a1c" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceMembers" ADD CONSTRAINT "FK_237b0d8a393e65f583d1093f34b" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceEvents" ADD CONSTRAINT "FK_849b795c276b83abb2036e72f66" FOREIGN KEY ("actor_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceEvents" ADD CONSTRAINT "FK_371048782c4848e75a0a2a7ddd9" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceViews" ADD CONSTRAINT "FK_87dce3fcc7b916a1016b8cde645" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ResourceViews" ADD CONSTRAINT "FK_9561f3e1485d892c0e308afe18a" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resources_levels_levels" ADD CONSTRAINT "FK_76dbf24f79131507986841a6257" FOREIGN KEY ("resourcesId") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "resources_levels_levels" ADD CONSTRAINT "FK_060b2d107b7ef8cba82e7351a4c" FOREIGN KEY ("levelsId") REFERENCES "Levels"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "resources_topics_topics" ADD CONSTRAINT "FK_1c140461e69db9f83a46b95ebc7" FOREIGN KEY ("resourcesId") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "resources_topics_topics" ADD CONSTRAINT "FK_92acaad3cea1894f6fdf34dadfd" FOREIGN KEY ("topicsId") REFERENCES "Topics"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resources_topics_topics" DROP CONSTRAINT "FK_92acaad3cea1894f6fdf34dadfd"`);
        await queryRunner.query(`ALTER TABLE "resources_topics_topics" DROP CONSTRAINT "FK_1c140461e69db9f83a46b95ebc7"`);
        await queryRunner.query(`ALTER TABLE "resources_levels_levels" DROP CONSTRAINT "FK_060b2d107b7ef8cba82e7351a4c"`);
        await queryRunner.query(`ALTER TABLE "resources_levels_levels" DROP CONSTRAINT "FK_76dbf24f79131507986841a6257"`);
        await queryRunner.query(`ALTER TABLE "ResourceViews" DROP CONSTRAINT "FK_9561f3e1485d892c0e308afe18a"`);
        await queryRunner.query(`ALTER TABLE "ResourceViews" DROP CONSTRAINT "FK_87dce3fcc7b916a1016b8cde645"`);
        await queryRunner.query(`ALTER TABLE "ResourceEvents" DROP CONSTRAINT "FK_371048782c4848e75a0a2a7ddd9"`);
        await queryRunner.query(`ALTER TABLE "ResourceEvents" DROP CONSTRAINT "FK_849b795c276b83abb2036e72f66"`);
        await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP CONSTRAINT "FK_237b0d8a393e65f583d1093f34b"`);
        await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP CONSTRAINT "FK_c46df0966d90f8f2906f1722a1c"`);
        await queryRunner.query(`ALTER TABLE "ResourceInvitations" DROP CONSTRAINT "FK_4e036ec09e73efafbc2b9c9dcfd"`);
        await queryRunner.query(`ALTER TABLE "ResourceInvitations" DROP CONSTRAINT "FK_8092663f4800cbfb8268f3bc87a"`);
        await queryRunner.query(`ALTER TABLE "ResourceInvitations" DROP CONSTRAINT "FK_b0163fcaa15a025dd5da3f73dfb"`);
        await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_04788812f73f37dda1257a47188"`);
        await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_200b6df5e4626a409c34ff439f4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_92acaad3cea1894f6fdf34dadf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1c140461e69db9f83a46b95ebc"`);
        await queryRunner.query(`DROP TABLE "resources_topics_topics"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_060b2d107b7ef8cba82e7351a4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_76dbf24f79131507986841a625"`);
        await queryRunner.query(`DROP TABLE "resources_levels_levels"`);
        await queryRunner.query(`DROP TABLE "ResourceViews"`);
        await queryRunner.query(`DROP TABLE "ResourceEvents"`);
        await queryRunner.query(`DROP TABLE "ResourceMembers"`);
        await queryRunner.query(`DROP TABLE "ResourceInvitations"`);
        await queryRunner.query(`DROP TABLE "Resources"`);
    }

}
