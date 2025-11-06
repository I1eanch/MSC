import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  UseGuards, 
  Request,
  Query,
  Put
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ChatService, CreateMessageDto, CreateConversationDto } from './chat.service';
import { UserRole } from '../entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversations')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create or get conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created or retrieved' })
  async createConversation(@Body() createConversationDto: CreateConversationDto) {
    return this.chatService.createConversation(createConversationDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getConversations(@Request() req) {
    return this.chatService.getUserConversations(req.user.id, req.user.role);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(@Param('id') id: string, @Request() req) {
    return this.chatService.getConversationById(id, req.user.id, req.user.role);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getMessages(@Param('id') conversationId: string, @Request() req) {
    return this.chatService.getConversationMessages(conversationId, req.user.id, req.user.role);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.chatService.createMessage(createMessageDto, req.user.id);
  }

  @Put('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  async markMessageAsRead(@Param('id') messageId: string, @Request() req) {
    await this.chatService.markMessageAsRead(messageId, req.user.id);
    return { message: 'Message marked as read' };
  }

  @Put('conversations/:id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  @ApiResponse({ status: 200, description: 'Conversation marked as read' })
  async markConversationAsRead(@Param('id') conversationId: string, @Request() req) {
    await this.chatService.markConversationAsRead(conversationId, req.user.id);
    return { message: 'Conversation marked as read' };
  }

  @Get('messages/unread/count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req) {
    const count = await this.chatService.getUnreadMessageCount(req.user.id);
    return { count };
  }

  @Get('admin/conversations')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all conversations for moderation' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getConversationsForModeration() {
    return this.chatService.getConversationsForModeration();
  }

  @Put('admin/conversations/:id/close')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Close conversation (admin only)' })
  @ApiResponse({ status: 200, description: 'Conversation closed successfully' })
  async closeConversation(@Param('id') conversationId: string) {
    return this.chatService.closeConversation(conversationId);
  }
}