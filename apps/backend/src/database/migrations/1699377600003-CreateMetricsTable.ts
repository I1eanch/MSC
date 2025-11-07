import { MigrationInterface, QueryRunner, Table, Index, ForeignKeyConstraint } from 'typeorm';

export class CreateMetricsTable1699377600003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'metrics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'value',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'recorded_date',
            type: 'date',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'additional_data',
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
      'metrics',
      new Index('IDX_METRICS_USER_ID', ['user_id']),
    );

    await queryRunner.createIndex(
      'metrics',
      new Index('IDX_METRICS_TYPE', ['type']),
    );

    await queryRunner.createIndex(
      'metrics',
      new Index('IDX_METRICS_RECORDED_DATE', ['recorded_date']),
    );

    await queryRunner.createForeignKey(
      'metrics',
      new ForeignKeyConstraint({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('metrics');
  }
}