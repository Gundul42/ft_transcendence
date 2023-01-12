import { Controller, Get, UseGuards, Res, Req, UseFilters, Query, Headers } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { AuthFilter } from './auth.filter';
import { ConfirmGuard } from './confirm.guard';
import { SessionService } from '../session/session.service';
import { Session } from '../session/session.entity';
import { AppUserService } from '../user/user.service';
import { AppUser } from '../user/user.entity';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Controller("api")
export class AuthController {
  constructor(private authService: AuthService, private sessionService: SessionService, private userService: AppUserService) {}

  @Get("auth")
  @UseGuards(AuthGuard)
  @UseFilters(AuthFilter)
  async login(@Req() req: Request, @Res() res, @RealIP() ip: string): Promise<void> {
    this.sessionService.removeEmpty();
    try {
      var session: any = await this.sessionService.joinUser(req.cookies['ft_transcendence_sessionId']);
      if (session === null) {
        throw new Error("Session not found")
      }
      console.log(session) //See what data is available and select it
    } catch (error) {
      console.log(error);
      this.sessionService.purgeIP(ip);
      res.clearCookie('ft_transcendence_sessionId');
      res.end();
    }
    res.send({
      'type' : 'content',
      'data' : {
        'full_name' : session.user.full_name,
      }
    });
  }

  @Get("signup")
  async signup(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Headers() headers, @RealIP() ip: string): Promise<any> {
    const state: string = this.authService.alphanum(20);
    const sessionId: string = this.authService.alphanum(20);
    await this.sessionService.add(sessionId, null, ip, new Date(Date.now()), state);
    res.cookie('ft_transcendence_sessionId', sessionId, { sameSite: 'none', secure: true});
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
      var session: Session = await this.sessionService.findOne(req.cookies['ft_transcendence_sessionId'], ip);
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
      var record_user: AppUser = await this.userService.findOne(user_data.data.id);
    } catch(error) {
      console.log(error);
      return;
    }
    if (record_user != null) {
      await AppUser.update({userid: user_data.data.id}, {
        access_token: token.data.access_token,
        token_type: token.data.token_type,
        expires_in: token.data.expires_in,
        refresh_token: token.data.refresh_token,
        scope: token.data.scope,
        created_at: token.data.created_at
      });
      await Session.update({sessionid: session.sessionid}, {
        user: record_user,
      });
      res.redirect('/');
    } else {
      console.log("Creating new user");
      this.userService.add(user_data.data.id, user_data.data.email, user_data.data.usual_full_name, token.data.access_token, token.data.token_type, token.data.expires_in, token.data.refresh_token, token.data.scope, token.data.created_at)
      .then (
        async (new_user) => {
          await Session.update({sessionid: session.sessionid}, {
            user: new_user
          });
          res.redirect('/');
        },
        (error) => {console.log(error)}
      )
    }
  }
}
