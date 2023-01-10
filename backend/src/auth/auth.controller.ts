import { Controller, Get, UseGuards, Res, Req, UseFilters, Query, Headers, Ip } from '@nestjs/common';
import { Request, Response } from "express";
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

@Controller("intra")
export class AuthController {
  constructor(private authService: AuthService, private sessionService: SessionService, private userService: AppUserService) {}

  @Get("auth")
  @UseGuards(AuthGuard)
  @UseFilters(AuthFilter)
  login(@Req() req: Request): string {
    console.log("Congrats you are in");
    return ("<p>Congrats you are in</p>");
  }

  @Get("hello")
  hello(): string {
    console.log("went into hello");
    return (this.authService.getHello());
  }

  @Get("signup")
  signup(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Headers() headers, @Ip() ip: string): Object {
    const state: string = this.authService.alphanum(20);
    const sessionId: string = this.authService.alphanum(20);
    console.log("client ip is " + ip);
    console.log("State is: " + state);
    this.sessionService.add(sessionId, null, ip, new Date(Date.now()), state);
    res.cookie('ft_transcendence_sessionId', sessionId);
    return ({html: `"${this.authService.getLink(state)}"`});
  }

  @Get("confirm")
  @UseGuards(ConfirmGuard)
  async confirm(@Req() req: Request, @Res() res: Response, @Query('code') code: string, @Ip() ip: string): Promise<void> {
    console.log("In confirm");
    this.sessionService.findOne(req.cookies['ft_transcendence_sessionId'], ip)
    .then(
      (session) => {
        this.authService.requestToken(code, session.state)
        .then(
          (token) => {
            this.authService.requestData(token.data.access_token)
            .then(
              (user_data) => {
                this.userService.findOne(user_data.data.id)
                .then(
                  async (record_user) => {
                    if (record_user != null) {
                      await AppUser.update({userid: user_data.data.id}, {
                        access_token: token.data.access_token,
                        token_type: token.data.token_type,
                        expires_in: token.data.expires_in,
                        refresh_token: token.data.refresh_token,
                        scope: token.data.scope,
                        created_at: token.data.created_at
                      });
                      console.log("Welcome back " + record_user);
                      res.redirect('/api/intra/auth');
                    }
                    else {
                      console.log("Creating new user");
                      this.userService.add(user_data.data.id, user_data.data.email, user_data.data.usual_full_name, token.data.access_token, token.data.token_type, token.data.expires_in, token.data.refresh_token, token.data.scope, token.data.created_at)
                      .then (
                        async (new_user) => {
                          await Session.update({sessionid: session.sessionid}, {
                            user: new_user
                          });
                          console.log("User created?");
                          res.redirect('/api/intra/auth');
                        },
                        (error) => {console.log(error)}
                      )
                    }
                  },
                  async (error) => {
                    console.log(error);
                  }
                )
              },
              (error) => {
                console.log(error);
              }
            )
          },
          (error) => {
            console.log(error);
          }
        )
      },
      (error) => {
        console.log(error);
      }
    )
    // return ("<p>Identity confirmed</p>");
  }
}
