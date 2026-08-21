import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { AntiDisintermediationService } from './anti-disintermediation.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, AntiDisintermediationService],
  exports: [ChatService, AntiDisintermediationService],
})
export class ChatModule {}
