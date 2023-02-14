import { Controller, Get, Post, UseGuards, Res, Req, UseFilters, Query, Param, InternalServerErrorException, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AchievementService } from '../achievement/achievement.service';
import { AuthGuard } from './auth.guard';
import { AuthFilter, TwoFAFilter } from './auth.filter';
import { ConfirmGuard } from './confirm.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Session, AppUser, Achieve, Token, UserRequest } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as twofactor from 'node-2fa';
import * as achievements from '../achievements.json';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller("auth")
export class AuthController {
	constructor(
		private authService: AuthService,
		private achievementService: AchievementService,
		private prisma: PrismaService) {}

	@Get("login")
	@UseGuards(AuthGuard)
	@UseFilters(AuthFilter, TwoFAFilter)
	async login(@Req() req: Request, @Res() res: Response): Promise<void> {
		this.authService.deleteNullSessions();
		var user: AppUser & { session: Session, friends: AppUser[], blocked: AppUser[], achievements: Achieve[], requests_sent: UserRequest[], requests_rec: any[] } = await this.authService.getUserSessionAchieve(req.cookies['ft_transcendence_sessionId']);
		if (user === null) {
			throw new InternalServerErrorException();
		}
		const csrf_token: { access_token: string } = await this.authService.generateJwt(user.full_name, user.id);
		const match_history: any = await this.authService.composeMatchHistory(user.id);
		res.send({
			'type' : 'content',
			'link': null,
			'data' : {
				id: user.id,
				full_name: user.full_name,
				email: user.email,
				display_name: user.display_name,
				twoFA: user.twoFA,
				avatar: user.avatar,
				status: user.status,
				wins: user.wins,
				losses: user.losses,
				ladder_level: user.ladder_level,
				friends: user.friends,
				blocked: user.blocked,
				achievements: user.achievements,
				match_history: match_history,
				csrf_token: csrf_token.access_token,
				requests_sent: user.requests_sent,
				requests_rec: user.requests_rec
			}
		});
	}

	@Get("signup")
	async signup(@Res({ passthrough: true }) res: Response, @RealIP() ip: string): Promise<{ type: string, data: null, link: string | null}> {
		const new_session: Session = await this.authService.setNewSession(uuidv4(), ip, uuidv4());
		if (new_session === null) {
			throw new InternalServerErrorException();
		}
		res.cookie('ft_transcendence_sessionId', new_session.id, { sameSite: 'none', secure: true, httpOnly: true});
		return ({
			'type' : 'link',
			'data' : null,
			'link' : `${this.authService.getLink(new_session.state)}`
		});
	}

	@Get("confirm")
	@UseGuards(ConfirmGuard)
	async confirm(@Req() req: Request, @Res() res: Response, @Query('code') code: string): Promise<void> {
		const session: Session = await this.authService.getSession(req.cookies['ft_transcendence_sessionId']);
		if (session === null) {
			throw new InternalServerErrorException();
		}
		const token: Token = await this.authService.requestToken(code, session.state);
		if (token === null) {
			throw new ServiceUnavailableException();
		}
		const user_data: any = await this.authService.requestData(token.access_token);
		if (user_data === null) {
			throw new ServiceUnavailableException();
		}
		const user: AppUser & { session: Session, token: Token} = await this.authService.upsertUserToken(user_data, token, session);
		if (user === null) {
			throw new InternalServerErrorException();
		}
		await this.authService.connectSession(session.id, user.id, user.twoFA);
		res.redirect('/');
	}

	/*
	Assign a dummy value to the sessionId, in such way the cookie and the sessionId will not match
	*/
	@Get('logout')
	@UseGuards(AuthGuard)
	async logOut(@Req() req: Request): Promise<void> {
		if (await this.authService.setDummySession(req.cookies['ft_transcendence_sessionId'], uuidv4()) === false) {
			throw new InternalServerErrorException();
		}
	}

	@Post("twoFA")
	@UseGuards(AuthGuard, JwtAuthGuard)
	async setTwoFA(@Req() req: Request): Promise<{ qr: string }> {
		const session: Session & { user: AppUser } = await this.authService.getSessionUser(req.cookies['ft_transcendence_sessionId']);
		if (session === null) {
			throw new InternalServerErrorException();
		} else if (session.user.twoFA) {
			if (await this.authService.deactivate2FA(session.user.id) === false) {
				throw new InternalServerErrorException();
			}
			return ({ qr: "" });
		} else {
			this.achievementService.grantAchievement(session.user.id, achievements.snowden);
			const secret = twofactor.generateSecret({name: "ft_transcendence", account: session.user.full_name });
			if (await this.authService.record2FA(session.user.id, secret.secret) === false) {
				throw new InternalServerErrorException();
			}
			return ({ qr: secret.qr });
		}
	}

	@Get('pass2FA')
	pass2FA() : { type: string, data: null, link: null} {
		return ({ type: "twoFA", data: null, link: null })
	}

	@Get('/dummy/:id')
	createDummy(@Res() res: Response, @Param('id') id: string) : void {
		res.cookie('ft_transcendence_sessionId', `dummysession${id}`, { sameSite: 'none', secure: true, httpOnly: true});
		this.prisma.appUser.create({
			data: {
				id: Math.floor(Math.random() * 800),
				session: {
					create: {
						id: `dummysession${id}`,
						state: uuidv4()
					},
				},
				token: {
					create: {
						access_token: `dummytoken${id}`,
						token_type: `dummytokentype${id}`,
						expires_in:	999,
						refresh_token: `dummyrefreshtoken${id}`,
						scope: `dummyscope${id}`,
						created_at: 42,
					},
				},
				full_name:	`dummy${id}`,
				display_name: `dummy${id}`,
				email: "nope@nope.nope",
			}
		})
		.then(() => {res.redirect("/")})
		.catch((err: any) => {
			console.log(err);
			throw new BadRequestException();
		})
	}
}
