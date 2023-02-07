import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatGateway } from './chat/chat.gateway';
import { GameModule } from './game/game.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { RoomsManager } from './chat/rooms/rooms.manager';
import { StorageManager } from './chat/storage/storage.manager';
import { AchievementModule } from './achievement/achievement.module';

@Module({
  imports: [
    AuthModule,
    ContentModule,
    PrismaModule,
    GameModule,
    UsersModule,
    AchievementModule,
    ConfigModule.forRoot(),
    ChatModule
  ], 
  providers: 
  [
    ChatGateway,
    RoomsManager,
    StorageManager
  ]
})
export class AppModule {}
