import { MigrationInterface, QueryRunner } from 'typeorm'

export class DeleteActivitiesWithDynamicNavigation1700939320576 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM "Sessions"
        WHERE source->'variables'->'settings'->'navigation'->>'mode' = 'dynamic';

        DELETE FROM "Activities"
        WHERE source->'variables'->'settings'->'navigation'->>'mode' = 'dynamic';
    `)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
