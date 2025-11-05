import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { RefreshToken } from './refresh-token.entity';
import { Goal } from './goal.entity';

export enum UserRole {
  USER = 'user',
  TRAINER = 'trainer',
  ADMIN = 'admin',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User role enum',
});

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ type: 'bigint', nullable: true })
  passwordResetExpires: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @Field(() => [Goal], { nullable: true })
  @ManyToMany(() => Goal, (goal) => goal.users)
  @JoinTable({
    name: 'user_goals',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'goalId', referencedColumnName: 'id' },
  })
  goals: Goal[];
}
