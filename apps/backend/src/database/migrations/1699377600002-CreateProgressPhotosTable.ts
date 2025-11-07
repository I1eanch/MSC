import { MigrationInterface, QueryRunner, Table, Index, ForeignKeyConstraint } from 'typeorm';

export class CreateProgressPhotosTable1699377600002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'progress_photos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'filename',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'original_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 's3_key',
            type: 'varchar',
            length: '500',
          },
          {
            name: 's3_bucket',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'file_size',
            type: 'bigint',
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'scan_status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'scan_result',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
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
      'progress_photos',
      new Index('IDX_PROGRESS_PHOTOS_USER_ID', ['user_id']),
    );

    await queryRunner.createIndex(
      'progress_photos',
      new Index('IDX_PROGRESS_PHOTOS_SCAN_STATUS', ['scan_status']),
    );

    await queryRunner.createForeignKey(
      'progress_photos',
      new ForeignKeyConstraint({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('progress_photos');
  }
}