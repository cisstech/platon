import { MigrationInterface, QueryRunner } from 'typeorm'

export class MissingCodeOnPersonalCircles1689267611619 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "Resources"  r
      SET "code" = (SELECT username FROM "Users" u WHERE u.id=r.owner_id LIMIT 1)
      WHERE "type" = 'CIRCLE' AND personal IS TRUE
    `)
  }

  public async down(): Promise<void> {
    //
  }
}
