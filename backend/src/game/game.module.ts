import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GameGateway } from './game.gateway';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { LobbyManager } from './lobby/lobby.manager';
import { AchievementService } from '../achievement/achievement.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AuthModule, HttpModule],
  providers: [
    JwtService,
    AuthService,
    GameGateway,
    LobbyManager,
    AchievementService
  ],
})
export class GameModule {}