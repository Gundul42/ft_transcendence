import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RoomsManager } from './rooms/rooms.manager';
import { StorageManager } from './storage/storage.manager';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    RoomsManager,
    StorageManager,
    AuthService,
    JwtService
  ]
})
export class ChatModule {}
