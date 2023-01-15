import { Controller, Get, UseGuards, Res, Req, UseFilters, Query, Headers } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { AuthFilter } from './auth.filter';
import { ConfirmGuard } from './confirm.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Session, AppUser } from '@prisma/client';
// import { SessionService } from '../session/session.service';
// import { Session } from '../session/session.entity';
// import { Service } from '../user/user.service';
// import {  } from '../user/user.entity';

@Controller("api")
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService/*private sessionService: SessionService, private userService: Service*/) {}

  @Get("auth")
  @UseGuards(AuthGuard)
  @UseFilters(AuthFilter)
  async login(@Req() req: Request, @Res() res, @RealIP() ip: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { user: null }
    });
    try {
      var session = await this.prisma.session.findUnique({
        where: { id: req.cookies['ft_transcendence_sessionId']},
        include: {
          user: true,
        },
      });
      if (session === null) {
        throw new Error("Session not found")
      }
      console.log(session) //See what data is available and select it
    } catch (error) {
      console.log(error);
      this.prisma.session.deleteMany({
        where : { ip_address: ip }
      });
      res.clearCookie('ft_transcendence_sessionId');
      res.end();
      return ;
    }
    res.send({
      'type' : 'content',
      'data' : {
        'full_name' : session.user.full_name,
      }
    });
  }

  @Get("signup")
  async signup(@Res({ passthrough: true }) res: Response, @RealIP() ip: string): Promise<any> {
    const state: string = this.authService.alphanum(20);
    const sessionId: string = this.authService.alphanum(20);
    await this.prisma.session.create({
      data : {
        id: sessionId,
        user: undefined,
        ip_address: ip,
        created_on: new Date(Date.now()),
        state: state
      }
    });
    res.cookie('ft_transcendence_sessionId', sessionId, { sameSite: 'none', secure: true, httpOnly: true});
    return (
      { 'type' : 'link',
        'data' : {
          'link' : `${this.authService.getLink(state)}`
        }
      });
  }

  @Get("confirm")
  @UseGuards(ConfirmGuard)
  async confirm(@Req() req: Request, @Res() res: Response, @Query('code') code: string, @RealIP() ip: string): Promise<void> {
    try {
      var session: Session = await this.prisma.session.findUnique({
        where: {
          id: req.cookies['ft_transcendence_sessionId'],
        }
      });
    } catch (error) {
      console.log(error);
      return;
    }
    try {
      var token: any = await this.authService.requestToken(code, session.state);
    } catch(error) {
      console.log(error);
      return;
    }
    try {
      var user_data: any = await this.authService.requestData(token.data.access_token);
      //console.log(user_data); //print user data to see what data is available from intra
    } catch(error) {
      console.log(error);
      return;
    }
    try {
      var record_user: AppUser = await this.prisma.appUser.findUnique({
        where: { id: user_data.data.id}
      });
      if (!record_user) {
          record_user = await this.prisma.appUser.create({
          data: {
            id: user_data.data.id,
            session: { connect: { id: session.id } },
            email: user_data.data.email,
            full_name: user_data.data.usual_full_name,
            access_token: token.data.access_token,
            token_type: token.data.token_type,
            expires_in: token.data.expires_in,
            refresh_token: token.data.refresh_token,
            scope: token.data.scope,
            created_at: token.data.created_at
          },
          include: { session: true },
        })
      } else {
        record_user = await this.prisma.appUser.update({
          where: { id: user_data.data.id},
          data: {
            access_token: token.data.access_token,
            token_type: token.data.token_type,
            expires_in: token.data.expires_in,
            refresh_token: token.data.refresh_token,
            scope: token.data.scope,
            created_at: token.data.created_at
          }
        })
      }
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          user: {
            connect: { id: record_user.id }
          }
        }
      });
      res.redirect('/');
    } catch(error) {
      console.log(error);
      return;
    };
  }
}
