import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { HabitFrequency } from './habit.entity';

@Entity('habit_templates')
export class HabitTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: HabitFrequency,
    default: HabitFrequency.DAILY,
  })
  frequency: HabitFrequency;

  @Column({ nullable: true })
  targetCount: number;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  icon: string;

  @Column()
  category: string;

  @Column({ type: 'jsonb' })
  goals: string[];

  @Column({ default: true })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
