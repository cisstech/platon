import { MigrationInterface, QueryRunner } from 'typeorm'

export class DropNotificationsSinceDateTypesAreTimzeZoneAwareNow1692703121857 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "Notifications"`)
  }

  public async down(): Promise<void> {
    // Nothing to do here
  }
}
