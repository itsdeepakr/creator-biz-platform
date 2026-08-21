import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto, CreateThreadDto, ReportThreadDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@CurrentUser() user: AuthUser) {
    return this.chatService.getConversations(user.id, user.role);
  }

  @Post('conversations')
  async getOrCreateThread(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateThreadDto,
  ) {
    return this.chatService.getOrCreateThread(user.id, user.role, dto);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @CurrentUser() user: AuthUser,
    @Param('id') threadId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(user.id, user.role, threadId, page, limit);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('id') threadId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user.id, threadId, dto);
  }

  @Post('messages/:id/flag')
  async flagMessage(
    @CurrentUser() user: AuthUser,
    @Param('id') messageId: string,
    @Body('reason') reason?: string,
  ) {
    return this.chatService.flagMessage(user.id, messageId, reason);
  }

  @Post('threads/:id/report')
  async reportThread(
    @CurrentUser() user: AuthUser,
    @Param('id') threadId: string,
    @Body() dto: ReportThreadDto,
  ) {
    return this.chatService.reportThread(user.id, threadId, dto);
  }
}
