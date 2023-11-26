import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdatePersonalCircleNames1701010299357 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "Resources" r
      SET name = u.username
      FROM "Users" u
      WHERE u.id = r.owner_id AND r.personal AND r.type = 'CIRCLE';
    `)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
