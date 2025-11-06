import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { ChatService } from '../chat/chat.service';
import { MessageType } from '../entities/message.entity';
import { AuthenticatedSocket } from '../interfaces/authenticated-socket.interface';

interface JoinRoomDto {
  conversationId: string;
}

interface SendMessageDto {
  conversationId: string;
  content: string;
  type?: MessageType;
  fileUrl?: string;
  fileName?: string;
}

interface TypingDto {
  conversationId: string;
  isTyping: boolean;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Socket>();

  constructor(private chatService: ChatService) {}

  async handleConnection(client: AuthenticatedSocket) {
    const user = client.user;
    if (!user) {
      client.disconnect();
      return;
    }

    this.connectedUsers.set(user.id, client);
    console.log(`User ${user.email} connected`);

    // Join user to their personal room for notifications
    client.join(user.id);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const user = client.user;
    if (user) {
      this.connectedUsers.delete(user.id);
      console.log(`User ${user.email} disconnected`);
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.user;
    if (!user) return;

    try {
      const conversation = await this.chatService.getConversationById(
        data.conversationId,
        user.id,
        user.role,
      );

      // Join the conversation room
      client.join(data.conversationId);

      // Notify other participants that user has joined
      client.to(data.conversationId).emit('userJoined', {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
      });

      // Send conversation history
      const messages = await this.chatService.getConversationMessages(
        data.conversationId,
        user.id,
        user.role,
      );

      client.emit('conversationHistory', {
        conversationId: data.conversationId,
        messages,
      });

    } catch (error) {
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.user;
    if (!user) return;

    try {
      const message = await this.chatService.createMessage(
        {
          content: data.content,
          type: data.type || MessageType.TEXT,
          conversationId: data.conversationId,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
        },
        user.id,
      );

      const conversation = await this.chatService.getConversationById(
        data.conversationId,
        user.id,
        user.role,
      );

      const receiverId = conversation.userId === user.id ? conversation.trainerId : conversation.userId;

      // Broadcast message to conversation room
      this.server.to(data.conversationId).emit('newMessage', {
        ...message,
        sender: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
        },
      });

      // Send push notification to receiver if they're not in the conversation room
      const receiverSocket = this.connectedUsers.get(receiverId);
      if (receiverSocket && !receiverSocket.rooms.has(data.conversationId)) {
        receiverSocket.emit('newMessageNotification', {
          conversationId: data.conversationId,
          message: {
            id: message.id,
            content: message.content,
            sender: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
            },
            createdAt: message.createdAt,
          },
        });
      }

    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: TypingDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.user;
    if (!user) return;

    try {
      await this.chatService.setTypingStatus(
        data.conversationId,
        user.id,
        data.isTyping,
      );

      // Broadcast typing indicator to conversation room (excluding sender)
      client.to(data.conversationId).emit('userTyping', {
        conversationId: data.conversationId,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        isTyping: data.isTyping,
      });

    } catch (error) {
      client.emit('error', { message: 'Failed to update typing status' });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() { messageId, conversationId }: { messageId: string; conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.user;
    if (!user) return;

    try {
      await this.chatService.markMessageAsRead(messageId, user.id);

      // Notify sender that message was read
      const message = await this.chatService.getConversationMessages(
        conversationId,
        user.id,
        user.role,
      );

      const readMessage = message.find(m => m.id === messageId);
      if (readMessage) {
        this.server.to(conversationId).emit('messageRead', {
          messageId,
          conversationId,
          readBy: user.id,
        });
      }

    } catch (error) {
      client.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.user;
    if (!user) return;

    // Leave the conversation room
    client.leave(data.conversationId);

    // Notify other participants
    client.to(data.conversationId).emit('userLeft', {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    });
  }
}