import { MigrationInterface, QueryRunner } from 'typeorm'
import { FixResourceStatsView1676229865368 } from './1676229865368-FixResourceStatsView'

export class ConvertCreateAndUpdateAtColumnToTimestampWithTimeZone1692701947399 implements MigrationInterface {
  name = 'ConvertCreateAndUpdateAtColumnToTimestampWithTimeZone1692701947399'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_e36823495b6fd5e00aeceedc43"`)
    await queryRunner.query(`ALTER TABLE "Topics" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Topics" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_7c17033a55b179291064cc3809"`)
    await queryRunner.query(`ALTER TABLE "Topics" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Topics" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_eef52c8c4b9357a1248ce1605a"`)
    await queryRunner.query(`ALTER TABLE "Levels" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Levels" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_c28d98ffab0b7443b96ba0fd95"`)
    await queryRunner.query(`ALTER TABLE "Levels" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Levels" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_932652535a6e452f74d450dfb7"`)
    await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Users" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_5abe0e95e97c3e6b9858dbc781"`)
    await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Users" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3aee2a43a2b66011304b529055"`)
    await queryRunner.query(`ALTER TABLE "UserGroups" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "UserGroups" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bdd234c9d0546c66d5258427a8"`)
    await queryRunner.query(`ALTER TABLE "UserGroups" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "UserGroups" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_874e99ed7aa65dfe03603ecd4e"`)
    await queryRunner.query(`ALTER TABLE "UserPrefs" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "UserPrefs" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6741094322252383e01c52f60b"`)
    await queryRunner.query(`ALTER TABLE "UserPrefs" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "UserPrefs" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_198b064b094080f5d97672938c"`)
    await queryRunner.query(`ALTER TABLE "Courses" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Courses" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6739ae395b173d6711c22ea9a3"`)
    await queryRunner.query(`ALTER TABLE "Courses" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Courses" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_25d354306e232a47a9caf2c844"`)
    await queryRunner.query(`ALTER TABLE "Notifications" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "Notifications" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_83a2c61c57d9d6c2cb48dccbf1"`)
    await queryRunner.query(`ALTER TABLE "Notifications" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "Notifications" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_b5b7714a4e20d9ee196c6e09b7"`)
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Resources" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_9bac50be3c70b5925224c2516e"`)
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "updated_at" CASCADE`)
    await queryRunner.query(`ALTER TABLE "Resources" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_8eb572e931ed6500241d826ac9"`)
    await queryRunner.query(`ALTER TABLE "CourseSections" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "CourseSections" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_e20a1df2c53aa44a5a0e3601b8"`)
    await queryRunner.query(`ALTER TABLE "CourseSections" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "CourseSections" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_40d656620e615f01758d696fdf"`)
    await queryRunner.query(`ALTER TABLE "Activities" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Activities" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_b2e8e9a7959c9afa7b622d9605"`)
    await queryRunner.query(`ALTER TABLE "Activities" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Activities" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_c29cd877bcaa59bb781bbd426d"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "CourseMembers" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_67b5aca86c71e51fe125dd96eb"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "CourseMembers" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_140135a0d5d0ea9d4969cd7cee"`)
    await queryRunner.query(`ALTER TABLE "ActivityMembers" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "ActivityMembers" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_593dac5d34e87fda4dfd6266f1"`)
    await queryRunner.query(`ALTER TABLE "ActivityMembers" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "ActivityMembers" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_331ca8a310a7b5f221513fd3e4"`)
    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "ActivityCorrectors" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_9854d5a90bb390d7146ff47368"`)
    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "ActivityCorrectors" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_12d86f8dcdcfd980520472524c"`)
    await queryRunner.query(`ALTER TABLE "Lmses" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Lmses" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_957d045337161dce0eccf6a5be"`)
    await queryRunner.query(`ALTER TABLE "Lmses" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Lmses" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ae9d2e2771addff9fb2af20079"`)
    await queryRunner.query(`ALTER TABLE "LmsUsers" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "LmsUsers" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e3803383ee0c23c2dcbbb1fecf"`)
    await queryRunner.query(`ALTER TABLE "LmsUsers" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "LmsUsers" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6ad48b5c0001176687589f3859"`)
    await queryRunner.query(`ALTER TABLE "ResourceInvitations" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "ResourceInvitations" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_23877e5e014f41874b2f9b0549"`)
    await queryRunner.query(`ALTER TABLE "ResourceInvitations" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "ResourceInvitations" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_70fc927171cc41d0c967cfb059"`)
    await queryRunner.query(`ALTER TABLE "ResourceEvents" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "ResourceEvents" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_42bf93a101e4cf2566e6cb0eba"`)
    await queryRunner.query(`ALTER TABLE "ResourceEvents" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "ResourceEvents" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_bfd3ad6ff767408be421ee5e2c"`)
    await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "ResourceMembers" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_3dc73bc260a636d8dc5b8665fc"`)
    await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "ResourceMembers" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_f2c4d7997d56c193ab00aa2ea7"`)
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "ResourceWatchers" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_723405bc72447213ed10426dfe"`)
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "ResourceWatchers" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_934cace09a24968ffc40b0374a"`)
    await queryRunner.query(`ALTER TABLE "ResourceViews" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "ResourceViews" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_d314c179fb30cf2fd0acb9b7e5"`)
    await queryRunner.query(`ALTER TABLE "ResourceViews" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "ResourceViews" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_4e0655114fd989e16947e760b0"`)
    await queryRunner.query(`ALTER TABLE "Corrections" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "Corrections" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_ee1df9539b7bff6de4e9340015"`)
    await queryRunner.query(`ALTER TABLE "Corrections" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "Corrections" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_be5f37e440062ddaff050b98d1"`)
    await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Sessions" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_4a05eb8345db2ef39dd57ebbbc"`)
    await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Sessions" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_0f28a257f8103ede2eb418be0d"`)
    await queryRunner.query(`ALTER TABLE "Answers" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Answers" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ba50dbd5a1494d54b91fe1e65e"`)
    await queryRunner.query(`ALTER TABLE "Answers" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Answers" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP INDEX "public"."IDX_dd2adc77f27f0e4ea65f39408e"`)
    await queryRunner.query(`ALTER TABLE "SessionComments" DROP COLUMN "created_at"`)
    await queryRunner.query(
      `ALTER TABLE "SessionComments" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_6e35d03db1940f7cff6213c81e"`)
    await queryRunner.query(`ALTER TABLE "SessionComments" DROP COLUMN "updated_at"`)
    await queryRunner.query(
      `ALTER TABLE "SessionComments" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    )
    await queryRunner.query(`CREATE INDEX "IDX_e36823495b6fd5e00aeceedc43" ON "Topics" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_7c17033a55b179291064cc3809" ON "Topics" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_eef52c8c4b9357a1248ce1605a" ON "Levels" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_c28d98ffab0b7443b96ba0fd95" ON "Levels" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_932652535a6e452f74d450dfb7" ON "Users" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_5abe0e95e97c3e6b9858dbc781" ON "Users" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_3aee2a43a2b66011304b529055" ON "UserGroups" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_bdd234c9d0546c66d5258427a8" ON "UserGroups" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_874e99ed7aa65dfe03603ecd4e" ON "UserPrefs" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_6741094322252383e01c52f60b" ON "UserPrefs" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_198b064b094080f5d97672938c" ON "Courses" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_6739ae395b173d6711c22ea9a3" ON "Courses" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_25d354306e232a47a9caf2c844" ON "Notifications" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_83a2c61c57d9d6c2cb48dccbf1" ON "Notifications" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_b5b7714a4e20d9ee196c6e09b7" ON "Resources" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_9bac50be3c70b5925224c2516e" ON "Resources" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_8eb572e931ed6500241d826ac9" ON "CourseSections" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_e20a1df2c53aa44a5a0e3601b8" ON "CourseSections" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_40d656620e615f01758d696fdf" ON "Activities" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_b2e8e9a7959c9afa7b622d9605" ON "Activities" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_c29cd877bcaa59bb781bbd426d" ON "CourseMembers" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_67b5aca86c71e51fe125dd96eb" ON "CourseMembers" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_140135a0d5d0ea9d4969cd7cee" ON "ActivityMembers" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_593dac5d34e87fda4dfd6266f1" ON "ActivityMembers" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_331ca8a310a7b5f221513fd3e4" ON "ActivityCorrectors" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_9854d5a90bb390d7146ff47368" ON "ActivityCorrectors" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_12d86f8dcdcfd980520472524c" ON "Lmses" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_957d045337161dce0eccf6a5be" ON "Lmses" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_ae9d2e2771addff9fb2af20079" ON "LmsUsers" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_e3803383ee0c23c2dcbbb1fecf" ON "LmsUsers" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_6ad48b5c0001176687589f3859" ON "ResourceInvitations" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_23877e5e014f41874b2f9b0549" ON "ResourceInvitations" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_70fc927171cc41d0c967cfb059" ON "ResourceEvents" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_42bf93a101e4cf2566e6cb0eba" ON "ResourceEvents" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_bfd3ad6ff767408be421ee5e2c" ON "ResourceMembers" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_3dc73bc260a636d8dc5b8665fc" ON "ResourceMembers" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_f2c4d7997d56c193ab00aa2ea7" ON "ResourceWatchers" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_723405bc72447213ed10426dfe" ON "ResourceWatchers" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_934cace09a24968ffc40b0374a" ON "ResourceViews" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_d314c179fb30cf2fd0acb9b7e5" ON "ResourceViews" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_4e0655114fd989e16947e760b0" ON "Corrections" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_ee1df9539b7bff6de4e9340015" ON "Corrections" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_be5f37e440062ddaff050b98d1" ON "Sessions" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_4a05eb8345db2ef39dd57ebbbc" ON "Sessions" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_0f28a257f8103ede2eb418be0d" ON "Answers" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_ba50dbd5a1494d54b91fe1e65e" ON "Answers" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_dd2adc77f27f0e4ea65f39408e" ON "SessionComments" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_6e35d03db1940f7cff6213c81e" ON "SessionComments" ("updated_at") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_6e35d03db1940f7cff6213c81e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_dd2adc77f27f0e4ea65f39408e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ba50dbd5a1494d54b91fe1e65e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_0f28a257f8103ede2eb418be0d"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_4a05eb8345db2ef39dd57ebbbc"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_be5f37e440062ddaff050b98d1"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ee1df9539b7bff6de4e9340015"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_4e0655114fd989e16947e760b0"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_d314c179fb30cf2fd0acb9b7e5"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_934cace09a24968ffc40b0374a"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_723405bc72447213ed10426dfe"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_f2c4d7997d56c193ab00aa2ea7"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3dc73bc260a636d8dc5b8665fc"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bfd3ad6ff767408be421ee5e2c"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_42bf93a101e4cf2566e6cb0eba"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_70fc927171cc41d0c967cfb059"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_23877e5e014f41874b2f9b0549"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6ad48b5c0001176687589f3859"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e3803383ee0c23c2dcbbb1fecf"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_ae9d2e2771addff9fb2af20079"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_957d045337161dce0eccf6a5be"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_12d86f8dcdcfd980520472524c"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_9854d5a90bb390d7146ff47368"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_331ca8a310a7b5f221513fd3e4"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_593dac5d34e87fda4dfd6266f1"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_140135a0d5d0ea9d4969cd7cee"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_67b5aca86c71e51fe125dd96eb"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_c29cd877bcaa59bb781bbd426d"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_b2e8e9a7959c9afa7b622d9605"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_40d656620e615f01758d696fdf"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e20a1df2c53aa44a5a0e3601b8"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_8eb572e931ed6500241d826ac9"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_9bac50be3c70b5925224c2516e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_b5b7714a4e20d9ee196c6e09b7"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_83a2c61c57d9d6c2cb48dccbf1"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_25d354306e232a47a9caf2c844"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6739ae395b173d6711c22ea9a3"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_198b064b094080f5d97672938c"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_6741094322252383e01c52f60b"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_874e99ed7aa65dfe03603ecd4e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bdd234c9d0546c66d5258427a8"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3aee2a43a2b66011304b529055"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_5abe0e95e97c3e6b9858dbc781"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_932652535a6e452f74d450dfb7"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_c28d98ffab0b7443b96ba0fd95"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_eef52c8c4b9357a1248ce1605a"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_7c17033a55b179291064cc3809"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_e36823495b6fd5e00aeceedc43"`)
    await queryRunner.query(`ALTER TABLE "SessionComments" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "SessionComments" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_6e35d03db1940f7cff6213c81e" ON "SessionComments" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "SessionComments" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "SessionComments" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_dd2adc77f27f0e4ea65f39408e" ON "SessionComments" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "Answers" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Answers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_ba50dbd5a1494d54b91fe1e65e" ON "Answers" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "Answers" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Answers" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_0f28a257f8103ede2eb418be0d" ON "Answers" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Sessions" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_4a05eb8345db2ef39dd57ebbbc" ON "Sessions" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Sessions" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_be5f37e440062ddaff050b98d1" ON "Sessions" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "Corrections" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Corrections" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_ee1df9539b7bff6de4e9340015" ON "Corrections" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "Corrections" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Corrections" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_4e0655114fd989e16947e760b0" ON "Corrections" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "ResourceViews" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "ResourceViews" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_d314c179fb30cf2fd0acb9b7e5" ON "ResourceViews" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "ResourceViews" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "ResourceViews" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_934cace09a24968ffc40b0374a" ON "ResourceViews" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_723405bc72447213ed10426dfe" ON "ResourceWatchers" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_f2c4d7997d56c193ab00aa2ea7" ON "ResourceWatchers" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "ResourceMembers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_3dc73bc260a636d8dc5b8665fc" ON "ResourceMembers" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "ResourceMembers" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "ResourceMembers" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_bfd3ad6ff767408be421ee5e2c" ON "ResourceMembers" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "ResourceEvents" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "ResourceEvents" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_42bf93a101e4cf2566e6cb0eba" ON "ResourceEvents" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "ResourceEvents" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "ResourceEvents" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_70fc927171cc41d0c967cfb059" ON "ResourceEvents" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "ResourceInvitations" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "ResourceInvitations" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_23877e5e014f41874b2f9b0549" ON "ResourceInvitations" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "ResourceInvitations" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "ResourceInvitations" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_6ad48b5c0001176687589f3859" ON "ResourceInvitations" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "LmsUsers" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "LmsUsers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_e3803383ee0c23c2dcbbb1fecf" ON "LmsUsers" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "LmsUsers" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "LmsUsers" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_ae9d2e2771addff9fb2af20079" ON "LmsUsers" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "Lmses" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Lmses" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_957d045337161dce0eccf6a5be" ON "Lmses" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "Lmses" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Lmses" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_12d86f8dcdcfd980520472524c" ON "Lmses" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_9854d5a90bb390d7146ff47368" ON "ActivityCorrectors" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_331ca8a310a7b5f221513fd3e4" ON "ActivityCorrectors" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "ActivityMembers" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "ActivityMembers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_593dac5d34e87fda4dfd6266f1" ON "ActivityMembers" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "ActivityMembers" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "ActivityMembers" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_140135a0d5d0ea9d4969cd7cee" ON "ActivityMembers" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_67b5aca86c71e51fe125dd96eb" ON "CourseMembers" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "CourseMembers" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "CourseMembers" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_c29cd877bcaa59bb781bbd426d" ON "CourseMembers" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "Activities" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Activities" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_b2e8e9a7959c9afa7b622d9605" ON "Activities" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "Activities" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Activities" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_40d656620e615f01758d696fdf" ON "Activities" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "CourseSections" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "CourseSections" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_e20a1df2c53aa44a5a0e3601b8" ON "CourseSections" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "CourseSections" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "CourseSections" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_8eb572e931ed6500241d826ac9" ON "CourseSections" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Resources" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_9bac50be3c70b5925224c2516e" ON "Resources" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "Resources" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Resources" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_b5b7714a4e20d9ee196c6e09b7" ON "Resources" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "Notifications" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Notifications" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_83a2c61c57d9d6c2cb48dccbf1" ON "Notifications" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "Notifications" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Notifications" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_25d354306e232a47a9caf2c844" ON "Notifications" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "Courses" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Courses" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_6739ae395b173d6711c22ea9a3" ON "Courses" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "Courses" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Courses" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_198b064b094080f5d97672938c" ON "Courses" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "UserPrefs" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "UserPrefs" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_6741094322252383e01c52f60b" ON "UserPrefs" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "UserPrefs" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "UserPrefs" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_874e99ed7aa65dfe03603ecd4e" ON "UserPrefs" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "UserGroups" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "UserGroups" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_bdd234c9d0546c66d5258427a8" ON "UserGroups" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "UserGroups" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "UserGroups" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_3aee2a43a2b66011304b529055" ON "UserGroups" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_5abe0e95e97c3e6b9858dbc781" ON "Users" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_932652535a6e452f74d450dfb7" ON "Users" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "Levels" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Levels" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_c28d98ffab0b7443b96ba0fd95" ON "Levels" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "Levels" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Levels" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_eef52c8c4b9357a1248ce1605a" ON "Levels" ("created_at") `)
    await queryRunner.query(`ALTER TABLE "Topics" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "Topics" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_7c17033a55b179291064cc3809" ON "Topics" ("updated_at") `)
    await queryRunner.query(`ALTER TABLE "Topics" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "Topics" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`CREATE INDEX "IDX_e36823495b6fd5e00aeceedc43" ON "Topics" ("created_at") `)
  }
}
