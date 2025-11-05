import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Habit } from './habit.entity';

@Entity('habit_completions')
@Unique(['habitId', 'completedDate'])
export class HabitCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Habit, (habit) => habit.completions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'habitId' })
  habit: Habit;

  @Column()
  habitId: string;

  @Column({ type: 'date' })
  completedDate: Date;

  @Column({ default: 1 })
  count: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
