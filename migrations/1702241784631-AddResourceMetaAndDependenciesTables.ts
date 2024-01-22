import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddResourceMetaAndDependenciesTables1702241784631 implements MigrationInterface {
  name = 'AddResourceMetaAndDependenciesTables1702241784631'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ResourceDependencies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "resource_version" character varying NOT NULL, "resource_id" uuid NOT NULL, "depend_on_version" character varying NOT NULL, "depend_on_id" uuid NOT NULL, CONSTRAINT "PK_14bf7e932e472349962a1a37abe" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_bbd4186f515752ea9b60a1dc05" ON "ResourceDependencies" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_9b39acef5705a21fa4dbb68573" ON "ResourceDependencies" ("updated_at") `)
    await queryRunner.query(
      `CREATE INDEX "ResourceDependencies_resource_id_idx" ON "ResourceDependencies" ("resource_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "ResourceDependencies_depend_on_id_idx" ON "ResourceDependencies" ("depend_on_id") `
    )
    await queryRunner.query(
      `CREATE TABLE "ResourceMeta" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "meta" jsonb NOT NULL DEFAULT '{}', "resource_id" uuid NOT NULL, CONSTRAINT "UQ_4f28b83421a4f688691ed52fec8" UNIQUE ("resource_id"), CONSTRAINT "PK_cfd3d5a61277628138aa903559d" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_0a83894ec91c9550047a70534d" ON "ResourceMeta" ("created_at") `)
    await queryRunner.query(`CREATE INDEX "IDX_5255e30de508c92e1f627f9e6e" ON "ResourceMeta" ("updated_at") `)
    await queryRunner.query(`CREATE INDEX "ResourceMeta_resource_idx" ON "ResourceMeta" ("resource_id") `)
    await queryRunner.query(
      `ALTER TABLE "ResourceDependencies" ADD CONSTRAINT "FK_e857cb383aefe88993ca6bb7d45" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceDependencies" ADD CONSTRAINT "FK_70bbc2ea1b20ff897548872aec0" FOREIGN KEY ("depend_on_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ResourceMeta" ADD CONSTRAINT "FK_4f28b83421a4f688691ed52fec8" FOREIGN KEY ("resource_id") REFERENCES "Resources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ResourceMeta" DROP CONSTRAINT "FK_4f28b83421a4f688691ed52fec8"`)
    await queryRunner.query(`ALTER TABLE "ResourceDependencies" DROP CONSTRAINT "FK_70bbc2ea1b20ff897548872aec0"`)
    await queryRunner.query(`ALTER TABLE "ResourceDependencies" DROP CONSTRAINT "FK_e857cb383aefe88993ca6bb7d45"`)
    await queryRunner.query(`DROP INDEX "public"."ResourceMeta_resource_idx"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_5255e30de508c92e1f627f9e6e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_0a83894ec91c9550047a70534d"`)
    await queryRunner.query(`DROP TABLE "ResourceMeta"`)
    await queryRunner.query(`DROP INDEX "public"."ResourceDependencies_depend_on_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."ResourceDependencies_resource_id_idx"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_9b39acef5705a21fa4dbb68573"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bbd4186f515752ea9b60a1dc05"`)
    await queryRunner.query(`DROP TABLE "ResourceDependencies"`)
  }
}
