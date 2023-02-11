import { MigrationInterface, QueryRunner } from "typeorm"

export class EnableUnaccentSearch1676148287928 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent`)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION public.f_unaccent(text)
      RETURNS text
      LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
      $func$
      SELECT public.unaccent('public.unaccent', $1)  -- schema-qualify function and dictionary
      $func$;
    `)

    await queryRunner.query(`CREATE INDEX "Resources_name_idx" ON "Resources" (f_unaccent(name))`)
    await queryRunner.query(`CREATE INDEX "Levels_name_idx" ON "Levels" (f_unaccent(name))`)
    await queryRunner.query(`CREATE INDEX "Topics_name_idx" ON "Topics" (f_unaccent(name))`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "Resources_name_idx"`)
    await queryRunner.query(`DROP INDEX "Levels_name_idx"`)
    await queryRunner.query(`DROP INDEX "Topics_name_idx"`)
  }
}
