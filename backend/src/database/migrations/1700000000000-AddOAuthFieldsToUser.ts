import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOAuthFieldsToUser1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'users',
      'password',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'provider',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'providerId',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'providerData',
        type: 'json',
        isNullable: true,
      }),
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_users_provider_providerId" ON "users" ("provider", "providerId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_provider_providerId"`);

    await queryRunner.dropColumn('users', 'providerData');
    await queryRunner.dropColumn('users', 'providerId');
    await queryRunner.dropColumn('users', 'provider');

    await queryRunner.changeColumn(
      'users',
      'password',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }
}
