import { Controller, Get, UseGuards, Res, Req, UseFilters, Param, Headers } from '@nestjs/common';
import { Request, Response } from "express";
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { AuthFilter } from './auth.filter';
import { ConfirmGuard } from './confirm.guard';
import { SessionService } from '../session/session.service';
import { Session } from '../session/session.entity';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Controller("api")
export class AuthController {
  constructor(private readonly authService: AuthService, private sessionService: SessionService) {}

  @Get("auth")
  @UseGuards(AuthGuard)
  @UseFilters(AuthFilter)
  login(@Req() req: Request): string {
    return ("<p>Congrats you are in</p>");
  }

  @Get("signup")
  signup(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Headers() headers): Object {
    const state: string = this.authService.alphanum(20);
    const sessionId: string = this.authService.alphanum(20);
    console.log(headers);
    this.sessionService.add(sessionId, 0, '127.0.0.1', new Date(Date.now()), state);
    res.cookie('ft_transcendence_sessionId', sessionId);
    console.log("arriving here");
    return ({html: `<a href="${this.authService.getLink(state)}">Authenticate through your intra page</a>`});
  }

  @Get("confirm/:code")
  @UseGuards(ConfirmGuard)
  confirm(@Req() req: Request, @Param('code') code: string): string {
    let sessionId: string = "";
    let state: string = "";
    let session: Promise<Session> = this.sessionService.findOne(req.cookies['ft_transcendence_sessionId'], "127.0.0.1");
    session.then(
      function(value) {
        sessionId = value.sessionid;
        state = value.state;
      },
      function(error) {
        console.log(error);
      }
    )
    let res: Promise<AxiosResponse<any>> = this.authService.requestToken(code, state);
    console.log(res);
    return ("<p>Identity confirmed</p>");
  }
}
