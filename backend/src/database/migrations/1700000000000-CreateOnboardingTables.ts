import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOnboardingTables1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'goals',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'displayOrder',
            type: 'integer',
            default: 0,
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'activity_levels',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'displayOrder',
            type: 'integer',
            default: 0,
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_onboarding',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'age',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'height',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'weight',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'activityLevelId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'healthConstraints',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'completionPercentage',
            type: 'integer',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_goals',
        columns: [
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'goalId',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'user_onboarding',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_onboarding',
      new TableForeignKey({
        columnNames: ['activityLevelId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'activity_levels',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'user_goals',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_goals',
      new TableForeignKey({
        columnNames: ['goalId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'goals',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userGoalsTable = await queryRunner.getTable('user_goals');
    const foreignKeys = userGoalsTable.foreignKeys;
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('user_goals', fk);
    }

    const onboardingTable = await queryRunner.getTable('user_onboarding');
    const onboardingForeignKeys = onboardingTable.foreignKeys;
    for (const fk of onboardingForeignKeys) {
      await queryRunner.dropForeignKey('user_onboarding', fk);
    }

    await queryRunner.dropTable('user_goals');
    await queryRunner.dropTable('user_onboarding');
    await queryRunner.dropTable('activity_levels');
    await queryRunner.dropTable('goals');
  }
}
