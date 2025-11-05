import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Goal } from './entities/goal.entity';
import { ActivityLevel } from './entities/activity-level.entity';
import { UserOnboarding } from './entities/user-onboarding.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'identity_db',
  synchronize: false,
  logging: true,
  entities: [User, RefreshToken, Goal, ActivityLevel, UserOnboarding],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
