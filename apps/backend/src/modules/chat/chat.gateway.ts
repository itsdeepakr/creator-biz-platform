import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }
      const secret = process.env.JWT_SECRET || 'change-me-in-production';
      const payload = await this.jwtService.verifyAsync(token as string, { secret });
      client.data.user = payload;
      this.logger.log(`Client connected: ${client.id}, user: ${payload.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinThread')
  async handleJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const room = `thread_${data.threadId}`;
    client.join(room);
    return { event: 'joinedThread', threadId: data.threadId };
  }

  @SubscribeMessage('leaveThread')
  async handleLeaveThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const room = `thread_${data.threadId}`;
    client.leave(room);
    return { event: 'leftThread', threadId: data.threadId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string; content: string; mediaUrls?: string[] },
  ) {
    const user = client.data.user;
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const message = await this.chatService.sendMessage(user.id, data.threadId, {
      content: data.content,
      mediaUrls: data.mediaUrls,
    });

    const room = `thread_${data.threadId}`;
    this.server.to(room).emit('newMessage', message);

    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string; isTyping: boolean },
  ) {
    const user = client.data.user;
    const room = `thread_${data.threadId}`;
    client.to(room).emit('userTyping', {
      userId: user?.id,
      isTyping: data.isTyping,
      threadId: data.threadId,
    });
  }
}
