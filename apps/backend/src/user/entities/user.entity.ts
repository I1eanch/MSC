import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Goal } from './goal.entity';
import { ProgressPhoto } from './progress-photo.entity';
import { Metric } from './metric.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  height?: number; // in cm

  @Column({ default: 'metric' })
  unitSystem: 'metric' | 'imperial';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Goal, (goal) => goal.user)
  goals: Goal[];

  @OneToMany(() => ProgressPhoto, (photo) => photo.user)
  progressPhotos: ProgressPhoto[];

  @OneToMany(() => Metric, (metric) => metric.user)
  metrics: Metric[];
}