import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RoomsManager } from './rooms/rooms.manager';

@Module({
  providers: [ChatGateway, ChatService, RoomsManager],
})
export class ChatModule {}
