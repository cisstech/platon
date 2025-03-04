import { MigrationInterface, QueryRunner } from "typeorm"

export class AddDeletedUser1727101443724 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO "Users" (id, username, first_name, last_name, email, role, password)
          VALUES ('00000000-0000-0000-0000-000000000000', 'deleted_user', 'Utilisateur', 'Supprimé', null, 'teacher', null)
          ON CONFLICT DO NOTHING`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.error('\x1b[31m%s\x1b[0m', 'THIS MIGRATION IS IRREVERSIBLE')
        console.error('\x1b[31m%s\x1b[0m', 'The deleted_user account cannot be deleted because it is used to retain resources of deleted users.');
    }

}
