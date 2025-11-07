import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum GoalType {
  WEIGHT_LOSS = 'weight_loss',
  WEIGHT_GAIN = 'weight_gain',
  MUSCLE_GAIN = 'muscle_gain',
  ENDURANCE = 'endurance',
  STRENGTH = 'strength',
  CUSTOM = 'custom',
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: GoalType })
  type: GoalType;

  @Column({ type: 'enum', enum: GoalStatus, default: GoalStatus.ACTIVE })
  status: GoalStatus;

  @Column({ type: 'jsonb', nullable: true })
  targetValue?: {
    weight?: number; // in kg or lbs
    bodyFat?: number; // percentage
    measurements?: Record<string, number>; // chest, waist, etc.
    custom?: Record<string, any>;
  };

  @Column({ type: 'date' })
  targetDate: Date;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  completedDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  progress?: {
    currentWeight?: number;
    currentBodyFat?: number;
    currentMeasurements?: Record<string, number>;
    percentageComplete?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}