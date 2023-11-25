import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialSchema1676148050728 implements MigrationInterface {
  name = 'InitialSchema1676148050728'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Levels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_18322e8ea03ecac3d45160cb96d" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "Topics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "PK_1ef7dd03abee738fa3199b5134d" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE TYPE "public"."Users_role_enum" AS ENUM('admin', 'teacher', 'student')`)
    await queryRunner.query(
      `CREATE TABLE "Users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "first_name" character varying NOT NULL DEFAULT '', "last_name" character varying NOT NULL DEFAULT '', "active" boolean NOT NULL DEFAULT true, "role" "public"."Users_role_enum" NOT NULL, "email" character varying, "password" character varying, "last_login" TIMESTAMP WITH TIME ZONE, "first_login" TIMESTAMP WITH TIME ZONE, CONSTRAINT "Users_unique_idx" UNIQUE ("username"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "UserPrefs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "REL_72085e53d2fe43668d3f38d3f1" UNIQUE ("user_id"), CONSTRAINT "PK_63e8f376b4fa1480e571c4f3446" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE TYPE "public"."Resources_type_enum" AS ENUM('CIRCLE', 'EXERCISE', 'ACTIVITY')`)
    await queryRunner.query(`CREATE TYPE "public"."Resources_visibility_enum" AS ENUM('PUBLIC', 'PRIVATE', 'PERSONAL')`)
    await queryRunner.query(
      `CREATE TYPE "public"."Resources_status_enum" AS ENUM('READY', 'DEPRECATED', 'BUGGED', 'NOT_TESTED', 'DRAFT')`
    )
    await queryRunner.query(
      `CREATE TABLE "Resources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "desc" character varying, "type" "public"."Resources_type_enum" NOT NULL, "visibility" "public"."Resources_visibility_enum" NOT NULL, "status" "public"."Resources_status_enum" NOT NULL DEFAULT 'READY', "owner_id" uuid NOT NULL, "parent_id" uuid, CONSTRAINT "PK_cb2d1b1fe8da812b2406657ccfa" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "ResourceMembers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "resource_id" uuid NOT NULL, "inviter_id" uuid NOT NULL, "permissionsRead" boolean NOT NULL DEFAULT true, "permissionsWrite" boolean NOT NULL DEFAULT true, CONSTRAINT "ResourceMembers_unique_idx" UNIQUE ("user_id", "resource_id"), CONSTRAINT "PK_4c636a2842d2926060716b74c8f" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "ResourceViews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "resource_id" uuid NOT NULL, CONSTRAINT "ResourceViews_unique_idx" UNIQUE ("user_id", "resource_id"), CONSTRAINT "PK_2a9295e1c25d780dc0f0d164bd7" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "ResourceInvitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "inviter_id" uuid NOT NULL, "invitee_id" uuid NOT NULL, "resource_id" uuid NOT NULL, "permissionsRead" boolean NOT NULL DEFAULT true, "permissionsWrite" boolean NOT NULL DEFAULT true, CONSTRAINT "ResourceInvitations_unique_idx" UNIQUE ("inviter_id", "invitee_id", "resource_id"), CONSTRAINT "PK_d5d767eb8a03af0801262f64b9b" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "Lmses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "url" character varying NOT NULL, "outcome_url" character varying NOT NULL, "consumer_key" character varying NOT NULL, "consumer_secret" character varying NOT NULL, CONSTRAINT "Lmses_unique_idx" UNIQUE ("consumer_key"), CONSTRAINT "PK_fda92ed08b62cd0e2f69fc03c67" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "LmsUsers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "lms_user_id" character varying NOT NULL, "lms_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "LmsUsers_unique_idx" UNIQUE ("lms_id", "lms_user_id", "user_id"), CONSTRAINT "PK_2f524117e5a571ca8149dfab28c" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "ResourceWatchers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "resource_id" uuid NOT NULL, CONSTRAINT "ResourceWatchers_unique_idx" UNIQUE ("user_id", "resource_id"), CONSTRAINT "PK_3253bda0ada45e7946356be435d" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."ResourceEvents_type_enum" AS ENUM('MEMBER_CREATE', 'MEMBER_REMOVE', 'RESOURCE_CREATE', 'RESOURCE_STATUS_CHANGE')`
    )
    await queryRunner.query(
      `CREATE TABLE "ResourceEvents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."ResourceEvents_type_enum" NOT NULL, "actor_id" uuid NOT NULL, "resource_id" uuid NOT NULL, "data" jsonb NOT NULL, CONSTRAINT "PK_576000477fde521a8ab09b49939" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "UserLevels" ("user_prefs_id" uuid NOT NULL, "level_id" uuid NOT NULL, CONSTRAINT "PK_7039085cc78b7b8c8482e00dd3d" PRIMARY KEY ("user_prefs_id", "level_id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_8735a6f4afd0dfe5dcc6d6e77d" ON "UserLevels" ("user_prefs_id") `)
    await queryRunner.query(`CREATE INDEX "IDX_1387f8a570fae868d582ab46ae" ON "UserLevels" ("level_id") `)
    await queryRunner.query(
      `CREATE TABLE "UserTopics" ("user_prefs_id" uuid NOT NULL, "topic_id" uuid NOT NULL, CONSTRAINT "PK_301ca3b58f4107df586829da3e3" PRIMARY KEY ("user_prefs_id", "topic_id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_fce7580c8fd680af994174b314" ON "UserTopics" ("user_prefs_id") `)
    await queryRunner.query(`CREATE INDEX "IDX_4d7b8431b1b7f2f1055369a9eb" ON "UserTopics" ("topic_id") `)
    await queryRunner.query(
      `CREATE TABLE "ResourceLevels" ("resource_id" uuid NOT NULL, "level_id" uuid NOT NULL, CONSTRAINT "PK_6fdd494d8980cf8ad1c5ea4db47" PRIMARY KEY ("resource_id", "level_id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_4120a12a69797d728bbc493ed8" ON "ResourceLevels" ("resource_id") `)
    await queryRunner.query(`CREATE INDEX "IDX_5639b23d5431cc19ceb5f0c999" ON "ResourceLevels" ("level_id") `)
    await queryRunner.query(
      `CREATE TABLE "ResourceTopics" ("resource_id" uuid NOT NULL, "topic_id" uuid NOT NULL, CONSTRAINT "PK_ad0fc2468681504d733292cf581" PRIMARY KEY ("resource_id", "topic_id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_d811c7a06f9fff035341aa7b3e" ON "ResourceTopics" ("resource_id") `)
    await queryRunner.query(`CREATE INDEX "IDX_8b695e3fba4b1bb0fe9c023240" ON "ResourceTopics" ("topic_id") `)
    await queryRunner.query(
      `ALTER TABLE "UserPrefs" ADD CONSTRAINT "FK_72085e53d2fe43668d3f38d3f1f" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "Resources" ADD CONSTRAINT "FK_200b6df5e4626a409c34ff439f4" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "Resources" ADD CONSTRAINT "FK_04788812f73f37dda1257a47188" FOREIGN KEY ("parent_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceMembers" ADD CONSTRAINT "FK_c46df0966d90f8f2906f1722a1c" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceMembers" ADD CONSTRAINT "FK_237b0d8a393e65f583d1093f34b" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceMembers" ADD CONSTRAINT "FK_a47597e9cbddc1c574fe4b70d78" FOREIGN KEY ("inviter_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceViews" ADD CONSTRAINT "FK_87dce3fcc7b916a1016b8cde645" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceViews" ADD CONSTRAINT "FK_9561f3e1485d892c0e308afe18a" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceInvitations" ADD CONSTRAINT "FK_b0163fcaa15a025dd5da3f73dfb" FOREIGN KEY ("inviter_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceInvitations" ADD CONSTRAINT "FK_8092663f4800cbfb8268f3bc87a" FOREIGN KEY ("invitee_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceInvitations" ADD CONSTRAINT "FK_4e036ec09e73efafbc2b9c9dcfd" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "LmsUsers" ADD CONSTRAINT "FK_f54bf115485bb640e184edda955" FOREIGN KEY ("lms_id") REFERENCES "Lmses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "LmsUsers" ADD CONSTRAINT "FK_8aac849edd33180c080cfddd9eb" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceWatchers" ADD CONSTRAINT "FK_b5ae51081d7ed4c46884fafe53e" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceWatchers" ADD CONSTRAINT "FK_3dd3c8e2e204466dc41a3b80d99" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceEvents" ADD CONSTRAINT "FK_849b795c276b83abb2036e72f66" FOREIGN KEY ("actor_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceEvents" ADD CONSTRAINT "FK_371048782c4848e75a0a2a7ddd9" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "UserLevels" ADD CONSTRAINT "FK_8735a6f4afd0dfe5dcc6d6e77da" FOREIGN KEY ("user_prefs_id") REFERENCES "UserPrefs"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "UserLevels" ADD CONSTRAINT "FK_1387f8a570fae868d582ab46aea" FOREIGN KEY ("level_id") REFERENCES "Levels"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "UserTopics" ADD CONSTRAINT "FK_fce7580c8fd680af994174b3142" FOREIGN KEY ("user_prefs_id") REFERENCES "UserPrefs"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "UserTopics" ADD CONSTRAINT "FK_4d7b8431b1b7f2f1055369a9ebe" FOREIGN KEY ("topic_id") REFERENCES "Topics"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceLevels" ADD CONSTRAINT "FK_4120a12a69797d728bbc493ed8b" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceLevels" ADD CONSTRAINT "FK_5639b23d5431cc19ceb5f0c999d" FOREIGN KEY ("level_id") REFERENCES "Levels"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceTopics" ADD CONSTRAINT "FK_d811c7a06f9fff035341aa7b3eb" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceTopics" ADD CONSTRAINT "FK_8b695e3fba4b1bb0fe9c023240c" FOREIGN KEY ("topic_id") REFERENCES "Topics"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ResourceTopics" DROP CONSTRAINT "FK_8b695e3fba4b1bb0fe9c023240c"`)
    await queryRunner.query(`ALTER TABLE "ResourceTopics" DROP CONSTRAINT "FK_d811c7a06f9fff035341aa7b3eb"`)
    await queryRunner.query(`ALTER TABLE "ResourceLevels" DROP CONSTRAINT "FK_5639b23d5431cc19ceb5f0c999d"`)
    await queryRunner.query(`ALTER TABLE "ResourceLevels" DROP CONSTRAINT "FK_4120a12a69797d728bbc493ed8b"`)
    await queryRunner.query(`ALTER TABLE "UserTopics" DROP CONSTRAINT "FK_4d7b8431b1b7f2f1055369a9ebe"`)
    await queryRunner.query(`ALTER TABLE "UserTopics" DROP CONSTRAINT "FK_fce7580c8fd680af994174b3142"`)
    await queryRunner.query(`ALTER TABLE "UserLevels" DROP CONSTRAINT "FK_1387f8a570fae868d582ab46aea"`)
    await queryRunner.query(`ALTER TABLE "UserLevels" DROP CONSTRAINT "FK_8735a6f4afd0dfe5dcc6d6e77da"`)
    await queryRunner.query(`ALTER TABLE "ResourceEvents" DROP CONSTRAINT "FK_371048782c4848e75a0a2a7ddd9"`)
    await queryRunner.query(`ALTER TABLE "ResourceEvents" DROP CONSTRAINT "FK_849b795c276b83abb2036e72f66"`)
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" DROP CONSTRAINT "FK_3dd3c8e2e204466dc41a3b80d99"`)
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" DROP CONSTRAINT "FK_b5ae51081d7ed4c46884fafe53e"`)
    await queryRunner.query(`ALTER TABLE "LmsUsers" DROP CONSTRAINT "FK_8aac849edd33180c080cfddd9eb"`)
    await queryRunner.query(`ALTER TABLE "LmsUsers" DROP CONSTRAINT "FK_f54bf115485bb640e184edda955"`)
    await queryRunner.query(`ALTER TABLE "ResourceInvitations" DROP CONSTRAINT "FK_4e036ec09e73efafbc2b9c9dcfd"`)
    await queryRunner.query(`ALTER TABLE "ResourceInvitations" DROP CONSTRAINT "FK_8092663f4800cbfb8268f3bc87a"`)
    await queryRunner.query(`ALTER TABLE "ResourceInvitations" DROP CONSTRAINT "FK_b0163fcaa15a025dd5da3f73dfb"`)
    await queryRunner.query(`ALTER TABLE "ResourceViews" DROP CONSTRAINT "FK_9561f3e1485d892c0e308afe18a"`)
    await queryRunner.query(`ALTER TABLE "ResourceViews" DROP CONSTRAINT "FK_87dce3fcc7b916a1016b8cde645"`)
    await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP CONSTRAINT "FK_a47597e9cbddc1c574fe4b70d78"`)
    await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP CONSTRAINT "FK_237b0d8a393e65f583d1093f34b"`)
    await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP CONSTRAINT "FK_c46df0966d90f8f2906f1722a1c"`)
    await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_04788812f73f37dda1257a47188"`)
    await queryRunner.query(`ALTER TABLE "Resources" DROP CONSTRAINT "FK_200b6df5e4626a409c34ff439f4"`)
    await queryRunner.query(`ALTER TABLE "UserPrefs" DROP CONSTRAINT "FK_72085e53d2fe43668d3f38d3f1f"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_8b695e3fba4b1bb0fe9c023240"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_d811c7a06f9fff035341aa7b3e"`)
    await queryRunner.query(`DROP TABLE "ResourceTopics"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_5639b23d5431cc19ceb5f0c999"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_4120a12a69797d728bbc493ed8"`)
    await queryRunner.query(`DROP TABLE "ResourceLevels"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_4d7b8431b1b7f2f1055369a9eb"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_fce7580c8fd680af994174b314"`)
    await queryRunner.query(`DROP TABLE "UserTopics"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_1387f8a570fae868d582ab46ae"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_8735a6f4afd0dfe5dcc6d6e77d"`)
    await queryRunner.query(`DROP TABLE "UserLevels"`)
    await queryRunner.query(`DROP TABLE "ResourceEvents"`)
    await queryRunner.query(`DROP TYPE "public"."ResourceEvents_type_enum"`)
    await queryRunner.query(`DROP TABLE "ResourceWatchers"`)
    await queryRunner.query(`DROP TABLE "LmsUsers"`)
    await queryRunner.query(`DROP TABLE "Lmses"`)
    await queryRunner.query(`DROP TABLE "ResourceInvitations"`)
    await queryRunner.query(`DROP TABLE "ResourceViews"`)
    await queryRunner.query(`DROP TABLE "ResourceMembers"`)
    await queryRunner.query(`DROP TABLE "Resources"`)
    await queryRunner.query(`DROP TYPE "public"."Resources_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."Resources_visibility_enum"`)
    await queryRunner.query(`DROP TYPE "public"."Resources_type_enum"`)
    await queryRunner.query(`DROP TABLE "UserPrefs"`)
    await queryRunner.query(`DROP TABLE "Users"`)
    await queryRunner.query(`DROP TYPE "public"."Users_role_enum"`)
    await queryRunner.query(`DROP TABLE "Topics"`)
    await queryRunner.query(`DROP TABLE "Levels"`)
  }
}
