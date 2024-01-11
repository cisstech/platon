import { MigrationInterface, QueryRunner } from 'typeorm'

export class MakePersonalCircleResourcesPersonal1704718460173 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "Resources" resource
      SET personal = true
      FROM "Resources" parent
      WHERE parent.id = resource.parent_id AND parent.personal = true
      ;
    `)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
