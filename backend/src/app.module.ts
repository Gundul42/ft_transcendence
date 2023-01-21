import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { ChatGateway } from './chat/chat.gateway';


@Module({
  imports: [
    AuthModule,
    ContentModule,
    PrismaModule,
    ChatModule,
    ConfigModule.forRoot(),/*
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'pgsql',
        port: 5432,
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [Session, AppUser],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),*/
  ], 
  providers: 
  [
    ChatGateway
  ]
})
export class AppModule {}
