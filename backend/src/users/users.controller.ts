import { Controller, Get, Post, UseGuards, Res, Req, Param, Body, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Express, Request, Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { IUserPublic } from '../Interfaces';
import { AppUser, Match, Session, UserRequest } from '@prisma/client';

@Controller('users')
export class UsersController {
	constructor(private userService: UsersService) {}

	@Get('userinfo/:id')
	@UseGuards(AuthGuard)
	async getUserInfo(@Param('id') id) : Promise<IUserPublic & {match_history: Match[]}> {
		const user: AppUser & { matches_won: (Match & { winner: IUserPublic, loser: IUserPublic})[], matches_lost: (Match & { winner: IUserPublic, loser: IUserPublic})[] } = await this.userService.findUser(id);
		if (user === null) {
			throw new BadRequestException("Selected user does not exist");
		} else {
			return ({
				id: id,
				display_name: user.display_name,
				avatar: user.avatar,
				status: user.status,
				match_history: this.userService.composeMatchHistory(user),
			})
		}
	}

	@Post('add-as-friend/:id')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async addAsFriend(@Param('id') id, @Req() req: Request) : Promise<void> {
		const session: Session & { user: AppUser } = await this.userService.getReqUser(req.cookies["ft_transcendence_sessionId"]);
		if (session === null || await this.userService.verifyFriendship(session.user.id, Number(id)) || await this.userService.verifyExistingRequest(session.user.id, Number(id))) {
			throw new BadRequestException("Connection with user already existed");
		} else if (await this.userService.registerRequest(session.user.id, Number(id), "friend")) {
			return ;
		} else {
			throw new InternalServerErrorException();
		}
	}

	@Post('respond')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async respondRequst(@Body('res') res: string, @Body('req_id') req_id: string, @Req() req: Request) : Promise<void> {
		const session: Session & { user: AppUser } = await this.userService.getReqUser(req.cookies["ft_transcendence_sessionId"]);
		if (session === null) {
			throw new InternalServerErrorException();
		}
		const request: UserRequest = await this.userService.getRequest(Number(req_id));
		if (request === null) {
			throw new BadRequestException("No user request found");
		} else if (request.receiver_id !== session.user.id) {
			throw new UnauthorizedException();
		}
		if (res === "true") {
			await this.userService.recordFriendship(request.sender_id, request.receiver_id);
		}
		await this.userService.deleteRequest(Number(req_id));
	}
}