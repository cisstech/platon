import { MigrationInterface, QueryRunner } from 'typeorm'

export class DropNotifications1701025870083 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM "Notifications" WHERE data->>'type' = 'RESOURCE-EVENT'
    `)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
