import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { LobbyManager } from './lobby/lobby.manager';
import { AchievementService } from '../Achievement/achievement.service';

@Module({
  providers: [
    GameGateway,
    LobbyManager,
    AchievementService
  ],
})
export class GameModule {}