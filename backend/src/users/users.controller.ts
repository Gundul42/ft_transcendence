import { Controller, Get, Post, UseGuards, Query, Req, Param, Body, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Express, Request, Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { IUserPublic, IUserPublicPage } from '../Interfaces';
import { AppUser, Match, Session, UserRequest, Achieve } from '@prisma/client';

@Controller('users')
export class UsersController {
	constructor(private userService: UsersService) {}

	@Get('userinfo/:id')
	@UseGuards(AuthGuard)
	async getUserInfo(@Param('id') id) : Promise<IUserPublicPage> {
		const user: AppUser & { achievements: Achieve[], matches_won: (Match & { winner: IUserPublic, loser: IUserPublic})[], matches_lost: (Match & { winner: IUserPublic, loser: IUserPublic})[] } = await this.userService.findUser(Number(id));
		if (user === null) {
			throw new BadRequestException("Selected user does not exist");
		} else {
			return ({
				id: Number(id),
				display_name: user.display_name,
				avatar: user.avatar,
				status: user.status,
				wins: user.wins,
				losses: user.losses,
				ladder_level: user.ladder_level,
				achievements: user.achievements,
				match_history: this.userService.composeMatchHistory(user),
			})
		}
	}

	@Get('search-all')
	@UseGuards(AuthGuard)
	async searchAll(@Query('start') start: string) : Promise<IUserPublic[]> {
		return await this.userService.getAllUsers(start);
	}

	@Post('add-as-friend/:id')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async addAsFriend(@Param('id') id, @Req() req: Request) : Promise<{req_id: number}> {
		const session: Session & { user: AppUser } = await this.userService.getReqUser(req.cookies["ft_transcendence_sessionId"]);
		if (session === null || await this.userService.verifyFriendship(session.user.id, Number(id)) || await this.userService.verifyExistingRequest(session.user.id, Number(id))) {
			throw new BadRequestException("Connection with user already existed");
		}
		const new_request: UserRequest = await this.userService.registerRequest(session.user.id, Number(id), "friend");
		if (new_request !== null) {
			return ({req_id: new_request.id});
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

	@Post('remove-friend/:id')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async removeFriend(@Param('id') id, @Req() req: Request) : Promise<void> {
		const session: Session & { user: AppUser } = await this.userService.getReqUser(req.cookies["ft_transcendence_sessionId"]);
		if (session === null) {
			throw new InternalServerErrorException();
		}
		if (await this.userService.removeFriendship(session.user.id, Number(id)) === false) {
			throw new BadRequestException("No relation found");
		}
	}

	@Post('block')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async blockUser(@Body('uid') uid: string, @Req() req: Request) : Promise<void> {
		const blocked_id:  number = Number(uid);
		const session: Session & { user: AppUser } = await this.userService.getReqUser(req.cookies["ft_transcendence_sessionId"]);
		if (session === null) {
			throw new InternalServerErrorException();
		} else if (session.user.id === blocked_id) {
			throw new BadRequestException("You cannot block yourself");
		} else if (await this.userService.recordBlockUser(session.user.id, blocked_id) === false) {
			throw new InternalServerErrorException();
		}
	}

	@Post('unblock')
	@UseGuards(AuthGuard, JwtAuthGuard)
	async unblockUser(@Body('uid') uid: string, @Req() req: Request) : Promise<void> {
		const blocked_id:  number = Number(uid);
		const session: Session & { user: AppUser } = await this.userService.getReqUser(req.cookies["ft_transcendence_sessionId"]);
		if (session === null) {
			throw new InternalServerErrorException();
		} else if (session.user.id === blocked_id) {
			throw new BadRequestException();
		} else if (await this.userService.cancelBlockUser(session.user.id, blocked_id) === false) {
			throw new InternalServerErrorException();
		}
	}
}