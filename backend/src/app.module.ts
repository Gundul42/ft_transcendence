import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { PrismaModule } from './prisma/prisma.module';
import { GameModule } from './game/game.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { AchievementModule } from './achievement/achievement.module';

@Module({
  imports: [
    AuthModule,
    ContentModule,
    PrismaModule,
    GameModule,
    UsersModule,
    AchievementModule,
    ConfigModule.forRoot({isGlobal: true}),
    ChatModule
  ]
})
export class AppModule {}
