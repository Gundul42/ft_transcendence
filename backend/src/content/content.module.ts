import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [ContentController],
  providers: [ContentService, AuthService, JwtService],
})
export class ContentModule {}
