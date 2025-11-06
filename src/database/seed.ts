import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User, UserRole } from '../entities/user.entity';
import { Conversation, ConversationStatus } from '../entities/conversation.entity';
import { Message, MessageType } from '../entities/message.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userRepository: Repository<User> = app.get(getRepositoryToken(User));
  const conversationRepository: Repository<Conversation> = app.get(getRepositoryToken(Conversation));
  const messageRepository: Repository<Message> = app.get(getRepositoryToken(Message));

  // Clear existing data
  await messageRepository.clear();
  await conversationRepository.clear();
  await userRepository.clear();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = userRepository.create({
    email: 'admin@example.com',
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
  });

  const trainer1 = userRepository.create({
    email: 'trainer1@example.com',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Trainer',
    role: UserRole.TRAINER,
  });

  const trainer2 = userRepository.create({
    email: 'trainer2@example.com',
    password: hashedPassword,
    firstName: 'Sarah',
    lastName: 'Coach',
    role: UserRole.TRAINER,
  });

  const user1 = userRepository.create({
    email: 'user1@example.com',
    password: hashedPassword,
    firstName: 'Alice',
    lastName: 'Johnson',
    role: UserRole.USER,
  });

  const user2 = userRepository.create({
    email: 'user2@example.com',
    password: hashedPassword,
    firstName: 'Bob',
    lastName: 'Smith',
    role: UserRole.USER,
  });

  const [savedAdmin, savedTrainer1, savedTrainer2, savedUser1, savedUser2] = 
    await userRepository.save([admin, trainer1, trainer2, user1, user2]);

  // Assign trainers to users
  savedUser1.assignedTrainerId = savedTrainer1.id;
  savedUser2.assignedTrainerId = savedTrainer2.id;
  await userRepository.save([savedUser1, savedUser2]);

  // Create conversations
  const conversation1 = conversationRepository.create({
    userId: savedUser1.id,
    trainerId: savedTrainer1.id,
    status: ConversationStatus.ACTIVE,
  });

  const conversation2 = conversationRepository.create({
    userId: savedUser2.id,
    trainerId: savedTrainer2.id,
    status: ConversationStatus.ACTIVE,
  });

  const [savedConversation1, savedConversation2] = 
    await conversationRepository.save([conversation1, conversation2]);

  // Create messages
  const messages = [
    {
      content: 'Hello! How can I help you today?',
      type: MessageType.TEXT,
      senderId: savedTrainer1.id,
      receiverId: savedUser1.id,
      conversationId: savedConversation1.id,
    },
    {
      content: 'Hi! I need some advice on my training routine.',
      type: MessageType.TEXT,
      senderId: savedUser1.id,
      receiverId: savedTrainer1.id,
      conversationId: savedConversation1.id,
    },
    {
      content: 'Of course! What specific area would you like to focus on?',
      type: MessageType.TEXT,
      senderId: savedTrainer1.id,
      receiverId: savedUser1.id,
      conversationId: savedConversation1.id,
    },
    {
      content: 'Welcome to your coaching session!',
      type: MessageType.TEXT,
      senderId: savedTrainer2.id,
      receiverId: savedUser2.id,
      conversationId: savedConversation2.id,
    },
    {
      content: 'Thank you! I\'m excited to get started.',
      type: MessageType.TEXT,
      senderId: savedUser2.id,
      receiverId: savedTrainer2.id,
      conversationId: savedConversation2.id,
    },
  ];

  const messageEntities = messages.map(msg => messageRepository.create(msg));
  await messageRepository.save(messageEntities);

  console.log('Database seeded successfully!');
  console.log('Test users created:');
  console.log('Admin: admin@example.com / password123');
  console.log('Trainer 1: trainer1@example.com / password123');
  console.log('Trainer 2: trainer2@example.com / password123');
  console.log('User 1: user1@example.com / password123');
  console.log('User 2: user2@example.com / password123');
  
  await app.close();
}

seed().catch(console.error);