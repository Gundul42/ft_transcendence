import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RoomsManager } from './rooms/rooms.manager';
import { StorageManager } from './storage/storage.manager';

@Module({
  providers: [ChatGateway, ChatService, RoomsManager, StorageManager]
})
export class ChatModule {}
