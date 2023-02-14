import { Controller, Post, UseGuards, Req, Param, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Request} from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppUser, Session } from '@prisma/client';
import { AchievementService } from './achievement.service';

@Controller('achievement')
export class AchievementController {
	constructor(private achievementService: AchievementService) {}
	
	@Post('aknowledge/:id')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async aknowledgeAchievement(@Req() req: Request, @Param("id") id) : Promise<void> {
		const session: Session & { user: AppUser } = await this.achievementService.getReqUser(req.cookies["ft_transcendence_sessionId"]);
		if (session === null) {
			throw new InternalServerErrorException();
		}
		if (await this.achievementService.aknowledge(session.user.id, Number(id)) === false) {
			throw new BadRequestException("Achievement id incorrect");
		}
	}
}
