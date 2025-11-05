import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';
import { Habit, HabitCompletion, HabitTemplate } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Habit, HabitCompletion, HabitTemplate])],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}
