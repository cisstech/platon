import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateSessionsIsBuilt1702480960983 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update all sessions to isBuilt = true
    await queryRunner.query(`
            UPDATE "Sessions"
            SET is_built = true
        `)
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No down migration
  }
}
