import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResourceWatcherEntity1676121565389 implements MigrationInterface {
  name = 'CreateResourceWatcherEntity1676121565389'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "ResourceWatchers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "resource_id" uuid NOT NULL, CONSTRAINT "ResourceWatchers_unique_idx" UNIQUE ("user_id", "resource_id"), CONSTRAINT "PK_3253bda0ada45e7946356be435d" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" ADD CONSTRAINT "FK_b5ae51081d7ed4c46884fafe53e" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" ADD CONSTRAINT "FK_3dd3c8e2e204466dc41a3b80d99" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" DROP CONSTRAINT "FK_3dd3c8e2e204466dc41a3b80d99"`);
    await queryRunner.query(`ALTER TABLE "ResourceWatchers" DROP CONSTRAINT "FK_b5ae51081d7ed4c46884fafe53e"`);
    await queryRunner.query(`DROP TABLE "ResourceWatchers"`);
  }

}
