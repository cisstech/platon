import { MigrationInterface, QueryRunner } from 'typeorm'

export class MakeCourseOwnerMandatory1677864763954 implements MigrationInterface {
  name = 'MakeCourseOwnerMandatory1677864763954'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Courses" DROP CONSTRAINT "FK_c0efa47921b253d65a1e59a89dc"`)
    await queryRunner.query(`ALTER TABLE "Courses" ALTER COLUMN "owner_id" SET NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "Courses" ADD CONSTRAINT "FK_c0efa47921b253d65a1e59a89dc" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Courses" DROP CONSTRAINT "FK_c0efa47921b253d65a1e59a89dc"`)
    await queryRunner.query(`ALTER TABLE "Courses" ALTER COLUMN "owner_id" DROP NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "Courses" ADD CONSTRAINT "FK_c0efa47921b253d65a1e59a89dc" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }
}
