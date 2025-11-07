import { MigrationInterface, QueryRunner, Table, Index, ForeignKeyConstraint } from 'typeorm';

export class CreateGoalsTable1699377600001 implements MigrationInterface {
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
            name: 'title',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
          },
          {
            name: 'target_value',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'target_date',
            type: 'date',
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'completed_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'progress',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'goals',
      new Index('IDX_GOALS_USER_ID', ['user_id']),
    );

    await queryRunner.createIndex(
      'goals',
      new Index('IDX_GOALS_STATUS', ['status']),
    );

    await queryRunner.createIndex(
      'goals',
      new Index('IDX_GOALS_TYPE', ['type']),
    );

    await queryRunner.createForeignKey(
      'goals',
      new ForeignKeyConstraint({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('goals');
  }
}