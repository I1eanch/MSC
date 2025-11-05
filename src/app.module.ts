import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HabitsModule } from './habits/habits.module';
import { AuthModule } from './auth/auth.module';
import { User, Habit, HabitCompletion, HabitTemplate } from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'habits_db',
      entities: [User, Habit, HabitCompletion, HabitTemplate],
      synchronize: process.env.NODE_ENV === 'development',
      logging: false,
    }),
    HabitsModule,
    AuthModule,
  ],
})
export class AppModule {}
