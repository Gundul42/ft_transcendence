import { Controller, Get, Post, UseGuards, Res, Req, Param, StreamableFile } from '@nestjs/common';
import { Request, Response } from 'express';
import { PlayService } from './play.service'; 
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AppUser } from '@prisma/client';

@Controller('play')
export class PlayController {
	constructor(private playService: PlayService, private prisma: PrismaService) {}

	@Get('matchmaking')
	@UseGuards(AuthGuard)
	async matchmaking(@Req() req: Request) : Promise<any> {
		const user: AppUser = await this.prisma.appUser.findUnique({
			where: { sessionid: req.cookies["ft_transcendence_sessionId"] }
		})
		const first_in_line: any = await this.playService.getFirstInLine(user);
		if (first_in_line === null) {
			await this.playService.addUserToQueue(user);
			let match: any = null; 
			let i = 0;
			while (match === null && i < 20) {
				match = await this.playService.getMatch(user);
				if (match !== null) {
					return ({ data: match });
				}
				setTimeout(() => { console.log("Looking for a match...")}, 1000000);
			}
			return ({
				data: null
			});
		} else {
			let match = await this.playService.createNewMatch(user, first_in_line.user);
			return ({ data: match });
		}

	}
}