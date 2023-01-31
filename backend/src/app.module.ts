import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { PrismaModule } from './prisma/prisma.module';
import { GameModule } from './game/game.module';


@Module({
  imports: [
    AuthModule,
    ContentModule,
    PrismaModule,
    GameModule,
    ConfigModule.forRoot()
  ], 
})
export class AppModule {}
