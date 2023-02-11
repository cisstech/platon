import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1676155737149 implements MigrationInterface {
  name = 'AddIndexes1676155737149'

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`DROP INDEX IF EXISTS "Levels_name_idx"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "Topics_name_idx"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "Resources_name_idx"`);

    await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "Users_unique_idx"`);
    await queryRunner.query(`CREATE INDEX "IDX_eef52c8c4b9357a1248ce1605a" ON "Levels" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_c28d98ffab0b7443b96ba0fd95" ON "Levels" ("updated_at") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "Levels_name_idx" ON "Levels" (f_unaccent(name)) `);
    await queryRunner.query(`CREATE INDEX "IDX_e36823495b6fd5e00aeceedc43" ON "Topics" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_7c17033a55b179291064cc3809" ON "Topics" ("updated_at") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "Topics_name_idx" ON "Topics" (f_unaccent(name)) `);
    await queryRunner.query(`CREATE INDEX "IDX_932652535a6e452f74d450dfb7" ON "Users" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_5abe0e95e97c3e6b9858dbc781" ON "Users" ("updated_at") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "Users_username_idx" ON "Users" ("username") `);
    await queryRunner.query(`CREATE INDEX "Users_first_name_idx" ON "Users" (f_unaccent(first_name)) `);
    await queryRunner.query(`CREATE INDEX "Users_last_name_idx" ON "Users" (f_unaccent(last_name)) `);
    await queryRunner.query(`CREATE INDEX "Users_role_idx" ON "Users" ("role") `);
    await queryRunner.query(`CREATE INDEX "Users_email_idx" ON "Users" ("email") `);
    await queryRunner.query(`CREATE INDEX "IDX_874e99ed7aa65dfe03603ecd4e" ON "UserPrefs" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_6741094322252383e01c52f60b" ON "UserPrefs" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "UserPrefs_user_id_idx" ON "UserPrefs" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_12d86f8dcdcfd980520472524c" ON "Lmses" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_957d045337161dce0eccf6a5be" ON "Lmses" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_b5b7714a4e20d9ee196c6e09b7" ON "Resources" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_9bac50be3c70b5925224c2516e" ON "Resources" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "Resources_name_idx" ON "Resources" (f_unaccent(name)) `);
    await queryRunner.query(`CREATE INDEX "Resources_type_idx" ON "Resources" ("type") `);
    await queryRunner.query(`CREATE INDEX "Resources_visibility_idx" ON "Resources" ("visibility") `);
    await queryRunner.query(`CREATE INDEX "Resources_status_idx" ON "Resources" ("status") `);
    await queryRunner.query(`CREATE INDEX "Resources_owner_idx" ON "Resources" ("owner_id") `);
    await queryRunner.query(`CREATE INDEX "Resources_parent_idx" ON "Resources" ("parent_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_70fc927171cc41d0c967cfb059" ON "ResourceEvents" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_42bf93a101e4cf2566e6cb0eba" ON "ResourceEvents" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "ResourceEvents_actor_id_idx" ON "ResourceEvents" ("actor_id") `);
    await queryRunner.query(`CREATE INDEX "ResourceEvents_resource_id_idx" ON "ResourceEvents" ("resource_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_6ad48b5c0001176687589f3859" ON "ResourceInvitations" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_23877e5e014f41874b2f9b0549" ON "ResourceInvitations" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_bfd3ad6ff767408be421ee5e2c" ON "ResourceMembers" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_3dc73bc260a636d8dc5b8665fc" ON "ResourceMembers" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_934cace09a24968ffc40b0374a" ON "ResourceViews" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_d314c179fb30cf2fd0acb9b7e5" ON "ResourceViews" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_ae9d2e2771addff9fb2af20079" ON "LmsUsers" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_e3803383ee0c23c2dcbbb1fecf" ON "LmsUsers" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_f2c4d7997d56c193ab00aa2ea7" ON "ResourceWatchers" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_723405bc72447213ed10426dfe" ON "ResourceWatchers" ("updated_at") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_723405bc72447213ed10426dfe"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f2c4d7997d56c193ab00aa2ea7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e3803383ee0c23c2dcbbb1fecf"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ae9d2e2771addff9fb2af20079"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d314c179fb30cf2fd0acb9b7e5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_934cace09a24968ffc40b0374a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3dc73bc260a636d8dc5b8665fc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bfd3ad6ff767408be421ee5e2c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_23877e5e014f41874b2f9b0549"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6ad48b5c0001176687589f3859"`);
    await queryRunner.query(`DROP INDEX "public"."ResourceEvents_resource_id_idx"`);
    await queryRunner.query(`DROP INDEX "public"."ResourceEvents_actor_id_idx"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_42bf93a101e4cf2566e6cb0eba"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_70fc927171cc41d0c967cfb059"`);
    await queryRunner.query(`DROP INDEX "public"."Resources_parent_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Resources_owner_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Resources_status_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Resources_visibility_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Resources_type_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Resources_name_idx"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9bac50be3c70b5925224c2516e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b5b7714a4e20d9ee196c6e09b7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_957d045337161dce0eccf6a5be"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_12d86f8dcdcfd980520472524c"`);
    await queryRunner.query(`DROP INDEX "public"."UserPrefs_user_id_idx"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6741094322252383e01c52f60b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_874e99ed7aa65dfe03603ecd4e"`);
    await queryRunner.query(`DROP INDEX "public"."Users_email_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Users_role_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Users_last_name_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Users_first_name_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Users_username_idx"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5abe0e95e97c3e6b9858dbc781"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_932652535a6e452f74d450dfb7"`);
    await queryRunner.query(`DROP INDEX "public"."Topics_name_idx"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7c17033a55b179291064cc3809"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e36823495b6fd5e00aeceedc43"`);
    await queryRunner.query(`DROP INDEX "public"."Levels_name_idx"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c28d98ffab0b7443b96ba0fd95"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_eef52c8c4b9357a1248ce1605a"`);
    await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "Users_unique_idx" UNIQUE ("username")`);
  }

}
