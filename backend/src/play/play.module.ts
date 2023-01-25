import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlayController } from './play.controller';
import { PlayService } from './play.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [PlayController],
  providers: [PlayService, AuthService],
})
export class PlayModule {}
