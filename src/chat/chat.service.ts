import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageType } from '../entities/message.entity';
import { Conversation, ConversationStatus } from '../entities/conversation.entity';
import { User, UserRole } from '../entities/user.entity';

export interface CreateMessageDto {
  content: string;
  type?: MessageType;
  conversationId: string;
  fileUrl?: string;
  fileName?: string;
}

export interface CreateConversationDto {
  userId: string;
  trainerId: string;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const { userId, trainerId } = createConversationDto;

    const user = await this.usersRepository.findOne({
      where: { id: userId, isActive: true },
    });

    const trainer = await this.usersRepository.findOne({
      where: { id: trainerId, role: UserRole.TRAINER, isActive: true },
    });

    if (!user || !trainer) {
      throw new NotFoundException('User or trainer not found');
    }

    const existingConversation = await this.conversationsRepository.findOne({
      where: {
        userId,
        trainerId,
        status: ConversationStatus.ACTIVE,
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = this.conversationsRepository.create({
      userId,
      trainerId,
    });

    return this.conversationsRepository.save(conversation);
  }

  async getConversationById(id: string, userId: string, userRole: UserRole): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id },
      relations: ['user', 'trainer', 'messages'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (userRole === UserRole.USER && conversation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === UserRole.TRAINER && conversation.trainerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return conversation;
  }

  async getUserConversations(userId: string, userRole: UserRole): Promise<Conversation[]> {
    const whereCondition = userRole === UserRole.USER 
      ? { userId, status: ConversationStatus.ACTIVE }
      : { trainerId: userId, status: ConversationStatus.ACTIVE };

    return this.conversationsRepository.find({
      where: whereCondition,
      relations: ['user', 'trainer'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async createMessage(createMessageDto: CreateMessageDto, senderId: string): Promise<Message> {
    const { conversationId, content, type = MessageType.TEXT, fileUrl, fileName } = createMessageDto;

    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const receiverId = conversation.userId === senderId ? conversation.trainerId : conversation.userId;

    const message = this.messagesRepository.create({
      content,
      type,
      senderId,
      receiverId,
      conversationId,
      fileUrl,
      fileName,
    });

    const savedMessage = await this.messagesRepository.save(message);

    await this.conversationsRepository.update(conversationId, {
      lastMessageAt: savedMessage.createdAt,
      lastMessagePreview: content.length > 50 ? content.substring(0, 50) + '...' : content,
    });

    return savedMessage;
  }

  async getConversationMessages(conversationId: string, userId: string, userRole: UserRole): Promise<Message[]> {
    await this.getConversationById(conversationId, userId, userRole);

    return this.messagesRepository.find({
      where: { conversationId },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId, receiverId: userId },
    });

    if (!message) {
      throw new NotFoundException('Message not found or access denied');
    }

    await this.messagesRepository.update(messageId, { isRead: true });
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messagesRepository.update(
      { conversationId, receiverId: userId, isRead: false },
      { isRead: true }
    );
  }

  async setTypingStatus(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const updateField = conversation.userId === userId ? 'isUserTyping' : 'isTrainerTyping';
    
    await this.conversationsRepository.update(conversationId, {
      [updateField]: isTyping,
    });
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    return this.messagesRepository.count({
      where: { receiverId: userId, isRead: false },
    });
  }

  async getConversationsForModeration(): Promise<Conversation[]> {
    return this.conversationsRepository.find({
      where: { status: ConversationStatus.ACTIVE },
      relations: ['user', 'trainer', 'messages'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async closeConversation(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    conversation.status = ConversationStatus.CLOSED;
    return this.conversationsRepository.save(conversation);
  }
}