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

export enum MetricType {
  WEIGHT = 'weight',
  BODY_FAT = 'body_fat',
  MUSCLE_MASS = 'muscle_mass',
  CHEST = 'chest',
  WAIST = 'waist',
  HIPS = 'hips',
  ARMS = 'arms',
  THIGHS = 'thighs',
  CALVES = 'calves',
  CUSTOM = 'custom',
}

@Entity('metrics')
export class Metric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MetricType })
  type: MetricType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit?: string; // kg, lbs, cm, inches, %

  @Column({ type: 'date' })
  recordedDate: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalData?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.metrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}