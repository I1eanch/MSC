import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  CLOSED = 'closed',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userConversations)
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.trainerConversations)
  trainer: User;

  @Column()
  trainerId: string;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @Column({ default: false })
  isUserTyping: boolean;

  @Column({ default: false })
  isTrainerTyping: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt?: Date;

  @Column({ nullable: true })
  lastMessagePreview?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}