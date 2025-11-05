import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from './user.entity';
import { ActivityLevel } from './activity-level.entity';

@ObjectType()
@Entity('user_onboarding')
export class UserOnboarding {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  age: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  gender: string;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Field(() => ActivityLevel, { nullable: true })
  @ManyToOne(() => ActivityLevel, { nullable: true })
  @JoinColumn({ name: 'activityLevelId' })
  activityLevel: ActivityLevel;

  @Column({ nullable: true })
  activityLevelId: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  healthConstraints: string;

  @Field(() => Int)
  @Column({ default: 0 })
  completionPercentage: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
