import { Controller, Get, Post, UseGuards, Res, Req, UseFilters, Query, Body } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { AuthFilter, TwoFAFilter } from './auth.filter';
import { ConfirmGuard } from './confirm.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Session, AppUser, Achieve, Token } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as twofactor from 'node-2fa';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService/*private sessionService: SessionService, private userService: Service*/) {}

  @Get("login")
  @UseGuards(AuthGuard)
  @UseFilters(AuthFilter, TwoFAFilter)
  async login(@Req() req: Request, @Res() res, @RealIP() ip: string): Promise<void> {
    this.authService.deleteNullSessions();
    var user: AppUser & { session: Session; friends: AppUser[]; achievements: Achieve[] } = await this.authService.getUserSessionAchieve(req.cookies['ft_transcendence_sessionId']);
    if (user === null) {
      throw new Error("Session not found")
    }
    console.log(user) //See what data is available and select it
    const csrf_token: { access_token: string } = await this.authService.generateJwt(user.full_name, user.id);
    res.send({
      'type' : 'content',
      'link': null,
      'data' : {
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
        achievements: user.achievements,
        match_history: [],
        csrf_token: csrf_token.access_token
      }
    });
  }

  @Get("signup")
  async signup(@Res({ passthrough: true }) res: Response, @RealIP() ip: string): Promise<{ type: string, data: null, link: string | null}> {
    const new_session: Session = await this.authService.setNewSession(uuidv4(), ip, uuidv4());
    if (new_session === null) {
      return ({ type: "Error: database could not create record", data: null, link: null });
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
  async confirm(@Req() req: Request, @Res() res: Response, @Query('code') code: string, @RealIP() ip: string): Promise<void> {
    const session: Session = await this.authService.getSession(req.cookies['ft_transcendence_sessionId']);
    if (session === null) {
      res.end();
    }
    const token: Token = await this.authService.requestToken(code, session.state);
    if (token === null) {
      res.end();
    }
    const user_data: any = await this.authService.requestData(token.access_token);
    if (user_data === null) {
      res.end();
    }
    const user: AppUser & { session: Session, token: Token} = await this.authService.upsertUserToken(user_data, token, session);
    if (user === null) {
      res.end();
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
    await this.authService.setDummySession(req.cookies['ft_transcendence_sessionId'], uuidv4());
  }

  @Post("twoFA")
  @UseGuards(AuthGuard, JwtAuthGuard)
  async setTwoFA(@Req() req: Request): Promise<any> {
    const session: Session & { user: AppUser } = await this.authService.getSessionUser(req.cookies['ft_transcendence_sessionId']);
    if (session === null) {
      return ({});
    } else if (session.user.twoFA) {
      this.authService.deactivate2FA(session.user.id);
      return ({ qr: null });
    } else {
      const secret = twofactor.generateSecret({name: "ft_transcendence", account: session.user.full_name });
      await this.authService.record2FA(session.user.id, secret.secret);
      return ({ qr: secret.qr });
    }
  }

  @Get('pass2FA')
  pass2FA() : { type: string, data: null, link: null} {
    return ({ type: "twoFA", data: null, link: null })
  }

  @Get(':id')
  createDummy(@Param('id') id: string) : {
	this.prismaclient.AppUser.create({
		data: {
			id: Math.floor(Math.random() * 800),
			session: {
				create: {
					id: "dummysession${id}",
				},
			},
			token: {
				create: {
					access_token: "dummytoken${id}",
					token_type: "dummytokentype${id}",
					expires_in:	999,
					refresh_token: "dummyrefreshtoken${id}",
					scope: "dummyscope${id}",
					created_at: 42,
				},
			},
			full_name:	'dummy ${id}',
			display_name: 'dummy ${id}',
		},
	})



  }
}
