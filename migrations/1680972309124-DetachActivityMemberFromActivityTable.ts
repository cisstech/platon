import { MigrationInterface, QueryRunner } from "typeorm";

export class DetachActivityMemberFromActivityTable1680972309124 implements MigrationInterface {
  name = 'DetachActivityMemberFromActivityTable1680972309124'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PlayerSessions" DROP CONSTRAINT "FK_1aeb8ab354c33789f9b124afca4"`);
    await queryRunner.query(`DROP INDEX "public"."PlayerSessions_activity_user_idx"`);

    await queryRunner.query(`CREATE TABLE "Activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "course_id" uuid NOT NULL, "section_id" uuid NOT NULL, "source" jsonb NOT NULL DEFAULT '{}', "open_at" TIMESTAMP WITH TIME ZONE, "close_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_68241637da2837e6d5a4db6f806" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_40d656620e615f01758d696fdf" ON "Activities" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_b2e8e9a7959c9afa7b622d9605" ON "Activities" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "Activities_course_id_idx" ON "Activities" ("course_id") `);
    await queryRunner.query(`CREATE INDEX "Activities_open_at_idx" ON "Activities" ("open_at") `);
    await queryRunner.query(`CREATE INDEX "Activities_close_at_idx" ON "Activities" ("close_at") `);
    await queryRunner.query(`CREATE INDEX "Activities_section_idx" ON "Activities" ("course_id", "section_id") `);

    await queryRunner.query(`CREATE TABLE "ActivityCorrectors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "activity_id" uuid NOT NULL, "member_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "ActivityCorrectors_activity_member_user_idx" UNIQUE ("activity_id", "member_id", "user_id"), CONSTRAINT "PK_383c973c7fc2a77a4baf6c5004f" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_331ca8a310a7b5f221513fd3e4" ON "ActivityCorrectors" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_9854d5a90bb390d7146ff47368" ON "ActivityCorrectors" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "ActivityCorrectors_activity_id_idx" ON "ActivityCorrectors" ("activity_id") `);

    await queryRunner.query(`CREATE TABLE "ActivityMembers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "activity_id" uuid NOT NULL, "member_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "ActivityMembers_activity_member_user_idx" UNIQUE ("activity_id", "member_id", "user_id"), CONSTRAINT "PK_73e1eed1957f10d17483d48dd28" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_140135a0d5d0ea9d4969cd7cee" ON "ActivityMembers" ("created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_593dac5d34e87fda4dfd6266f1" ON "ActivityMembers" ("updated_at") `);
    await queryRunner.query(`CREATE INDEX "ActivityMembers_activity_id_idx" ON "ActivityMembers" ("activity_id") `);

    await queryRunner.query(`ALTER TABLE "PlayerSessions" DROP COLUMN "course_activity_id"`);
    await queryRunner.query(`ALTER TABLE "PlayerSessions" ADD "activity_id" uuid`);
    await queryRunner.query(`ALTER TABLE "PlayerSessions" ADD "correction" integer`);

    await queryRunner.query(`CREATE INDEX "PlayerSessions_activity_user_idx" ON "PlayerSessions" ("parent_id", "activity_id", "user_id") `);

    await queryRunner.query(`ALTER TABLE "Activities" ADD CONSTRAINT "FK_b8567bb38e00127d32015f4fffd" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "Activities" ADD CONSTRAINT "FK_b16c707b85c1e2ec82a573a4b4a" FOREIGN KEY ("section_id") REFERENCES "CourseSections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" ADD CONSTRAINT "FK_16d7b38a5596d08a1d8f6d00acd" FOREIGN KEY ("activity_id") REFERENCES "Activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" ADD CONSTRAINT "FK_e2203531590a1f7669ca4e5e5b3" FOREIGN KEY ("member_id") REFERENCES "CourseMembers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" ADD CONSTRAINT "FK_164a2e57f95c37c1d5f386451de" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

    await queryRunner.query(`ALTER TABLE "ActivityMembers" ADD CONSTRAINT "FK_960ad79795412126f3e0f1c2322" FOREIGN KEY ("activity_id") REFERENCES "Activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "ActivityMembers" ADD CONSTRAINT "FK_c8c6e6e5293badf7f99bdc7974f" FOREIGN KEY ("member_id") REFERENCES "CourseMembers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "ActivityMembers" ADD CONSTRAINT "FK_de88cbf804475810a93bc018640" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

    await queryRunner.query(`ALTER TABLE "PlayerSessions" ADD CONSTRAINT "FK_aa77a289baabc35cb2c537a09c1" FOREIGN KEY ("activity_id") REFERENCES "Activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "PlayerSessions" DROP CONSTRAINT "FK_aa77a289baabc35cb2c537a09c1"`);

    await queryRunner.query(`ALTER TABLE "ActivityMembers" DROP CONSTRAINT "FK_de88cbf804475810a93bc018640"`);
    await queryRunner.query(`ALTER TABLE "ActivityMembers" DROP CONSTRAINT "FK_c8c6e6e5293badf7f99bdc7974f"`);
    await queryRunner.query(`ALTER TABLE "ActivityMembers" DROP CONSTRAINT "FK_960ad79795412126f3e0f1c2322"`);

    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" DROP CONSTRAINT "FK_164a2e57f95c37c1d5f386451de"`);
    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" DROP CONSTRAINT "FK_e2203531590a1f7669ca4e5e5b3"`);
    await queryRunner.query(`ALTER TABLE "ActivityCorrectors" DROP CONSTRAINT "FK_16d7b38a5596d08a1d8f6d00acd"`);

    await queryRunner.query(`ALTER TABLE "Activities" DROP CONSTRAINT "FK_b16c707b85c1e2ec82a573a4b4a"`);
    await queryRunner.query(`ALTER TABLE "Activities" DROP CONSTRAINT "FK_b8567bb38e00127d32015f4fffd"`);

    await queryRunner.query(`DROP INDEX "public"."PlayerSessions_activity_user_idx"`);
    await queryRunner.query(`ALTER TABLE "PlayerSessions" DROP COLUMN "correction"`);
    await queryRunner.query(`ALTER TABLE "PlayerSessions" DROP COLUMN "activity_id"`);
    await queryRunner.query(`ALTER TABLE "PlayerSessions" ADD "course_activity_id" uuid`);

    await queryRunner.query(`DROP INDEX "public"."ActivityMembers_activity_id_idx"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_593dac5d34e87fda4dfd6266f1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_140135a0d5d0ea9d4969cd7cee"`);
    await queryRunner.query(`DROP TABLE "ActivityMembers"`);

    await queryRunner.query(`DROP INDEX "public"."ActivityCorrectors_activity_id_idx"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9854d5a90bb390d7146ff47368"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_331ca8a310a7b5f221513fd3e4"`);
    await queryRunner.query(`DROP TABLE "ActivityCorrectors"`);

    await queryRunner.query(`DROP INDEX "public"."Activities_section_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Activities_close_at_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Activities_open_at_idx"`);
    await queryRunner.query(`DROP INDEX "public"."Activities_course_id_idx"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b2e8e9a7959c9afa7b622d9605"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_40d656620e615f01758d696fdf"`);

    await queryRunner.query(`DROP TABLE "Activities"`);

    await queryRunner.query(`CREATE INDEX "PlayerSessions_activity_user_idx" ON "PlayerSessions" ("parent_id", "user_id", "course_activity_id") `);
    await queryRunner.query(`ALTER TABLE "PlayerSessions" ADD CONSTRAINT "FK_1aeb8ab354c33789f9b124afca4" FOREIGN KEY ("course_activity_id") REFERENCES "CourseActivities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

}
