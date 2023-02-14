import { Module } from '@nestjs/common';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { AuthService } from '../auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [HttpModule],
  providers: [
    AchievementService,
    AuthService,
    JwtService
  ],
  controllers: [AchievementController]
})
export class AchievementModule {}
