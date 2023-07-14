import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMissingPropertyOnResourceEvents1689245413630 implements MigrationInterface {
  name?: string | undefined
  transaction?: boolean | undefined

  public async up(queryRunner: QueryRunner): Promise<void> {
    const members = await queryRunner.query(` SELECT * FROM "ResourceEvents" WHERE "type" = 'MEMBER_REMOVE'`)
    await Promise.all(
      members.map(async (member: { id: string; resource_id: string; data: Record<string, unknown> }) => {
        const resource = (
          await queryRunner.query(` SELECT type, name FROM "Resources"  WHERE id = $1  `, [member.resource_id])
        )[0] as { type: string; name: string }

        if (!resource) return

        return queryRunner.query(
          `
          UPDATE "ResourceEvents"
          SET data = $1
          WHERE id = $2
        `,

          [
            {
              ...member.data,
              resourceName: resource.name,
              resourceType: resource.type,
            },
            member.id,
          ]
        )
      })
    )
  }

  public async down(): Promise<void> {
    //
  }
}
