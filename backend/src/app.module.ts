import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatGateway } from './chat/chat.gateway';
import { PlayModule } from './play/play.module';


@Module({
  imports: [
    AuthModule,
    ContentModule,
    PlayModule,
    PrismaModule,
    ConfigModule.forRoot()
  ], 
  providers: 
  [
    ChatGateway
  ]
})
export class AppModule {}
