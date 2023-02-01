import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatGateway } from './chat/chat.gateway';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { RoomsManager } from './chat/rooms/rooms.manager';


@Module({
  imports: [
    AuthModule,
    ContentModule,
    PrismaModule,
    GameModule,
    ConfigModule.forRoot(),
    ChatModule
  ], 
  providers: 
  [
    ChatGateway, RoomsManager
  ]
})
export class AppModule {}
