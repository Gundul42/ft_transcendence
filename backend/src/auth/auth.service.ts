import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request } from "express";
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import * as info from './info.json'
import * as twofactor from 'node-2fa';
import { PrismaService } from '../prisma/prisma.service';
import { Session, AppUser, Achieve, Token, TwoFA } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor (
    private prisma: PrismaService,
    private readonly httpService: HttpService,
    private jwtService: JwtService
  ) {}

  getLink(state: string): string {
    const ft_uri = new URLSearchParams("");
    ft_uri.append("client_id", info.client_id);
    ft_uri.append("redirect_uri", info.redirect_uri);
    ft_uri.append("scope", info.scope);
    ft_uri.append("response_type", "code");
    ft_uri.append("state", state);
    return (info.ftAPI.url + info.ftAPI.auth + "?" + ft_uri.toString());
  }

  async requestToken(authCode: string, clientState: string) : Promise<Token> {
    return await this.httpService.axiosRef.post(info.ftAPI.url + info.ftAPI.token, {
      grant_type : 'authorization_code',
      client_id : info.client_id,
      client_secret : info.secret,
      code : authCode,
      redirect_uri : info.redirect_uri,
      state : clientState
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((value:any) => {return (value.data)})
    .catch((err: any) => {
      console.log(err);
      return (null);
    });
  }

  async requestData(access_token: string) : Promise<AxiosResponse<any>> {
    return await this.httpService.axiosRef.get(info.ftAPI.url + info.ftAPI.user_data, {
      headers : {
        'Authorization': 'Bearer ' + access_token
      }
    })
    .catch((err: any) => {
      console.log(err);
      return null;
    })
  }

  async deactivate2FA(userid: number) : Promise<void> {
    await this.prisma.appUser.update({
      where: { id: userid },
      data: {
        twoFA: false,
        twoFA_token: { delete: true }
      }
    })
  }

  async record2FA(userid: number, token: string) : Promise<void> {
    await this.prisma.appUser.update({
      where: { id: userid },
      data: {
        twoFA: true,
        twoFA_token: {
          create: { id: token }
        }
      }
    })
  }

  deleteNullSessions() : void {
    this.prisma.session.deleteMany({
      where: { user: null }
    })
    .catch((err: any) => {console.log(err)});
  }

  async generateJwt(user_name: string, user_id: number): Promise<{ access_token: string }> {
    return ({
      access_token: this.jwtService.sign({
        username: user_name,
        sub: user_id
      })
    });
  }

  // Guards

  async validateSession(req: Request) : Promise<boolean> {
    if (!req.cookies['ft_transcendence_sessionId']) {
      throw new UnauthorizedException();
    }
    return await this.prisma.session.findUnique({
      where: {
        id: req.cookies['ft_transcendence_sessionId'],
      },
      include: { user: true }
    })
    .then(
      (value: Session & { user: AppUser }) => {
        if (value == null || value.user == null || value.user.id == null) {
          console.log("Session does not exist");
          throw new UnauthorizedException();
        } else {
          return true;
        }
      },
      (err: any) => {
        console.log(err);
        throw new UnauthorizedException();
      }
    )
  }

  async validate2FA(req: Request) : Promise<boolean> {
    return await this.prisma.session.findUnique({
      where: {
        id: req.cookies['ft_transcendence_sessionId'],
      },
      include: {
        user: {
          include: { twoFA_token: true }
        }
      }
    })
    .then(
      async (value: Session & { user: AppUser & { twoFA_token: TwoFA }}) => {
        if (value === null) {
          throw new UnauthorizedException();
        }
        else if (value.twoFA_locked) {
          if ((req.query.otp !== null) && (twofactor.verifyToken(value.user.twoFA_token.id, (req.query.otp as string)) !== null)) {
            console.log("2FA successful");
            await this.prisma.session.update({
              where: {
                id: req.cookies['ft_transcendence_sessionId'],
              },
              data: {
                twoFA_locked: false,
              }
            })
            .catch((err: any) => {
              console.log(err);
              throw new ForbiddenException();
            });
          } else {
            console.log("2 FActor Authentication is active for this account");
            throw new ForbiddenException();
          }
        }
        return (true);
      },
      (err: any) => {
        console.log(err);
        throw new UnauthorizedException();
      }
    )
  }

  async confirmSignup(req: Request) : Promise<boolean> {
    const url_request: URL = new URL("https://localhost" + req.url);
    if (!req.cookies['ft_transcendence_sessionId']) {
      throw new UnauthorizedException();
    }
    return await this.prisma.session.findUnique({
      where: {
        id: req.cookies['ft_transcendence_sessionId'],
      }
    })
    .then(
      (session: Session) => {
        if (url_request.searchParams.get('state') === null) {
          console.log("URL is missing authentication data");
          throw new UnauthorizedException();
        }
        else if (session === null || session.state === null) {
          console.log("Session was registered incorrectly");
          throw new UnauthorizedException();
        }
        else if (session.state != url_request.searchParams.get('state')?.replace(/\\$/g, '')) {
          console.log("Third party request");
          throw new UnauthorizedException();
        }
        return true;
      },
      (err: any) => {
        console.log(err);
        throw new UnauthorizedException();
      }
    )
  }

  //Getters

  async getSession(sessionid: string) : Promise<Session> {
    return await this.prisma.session.findUnique({
      where: {
        id: sessionid,
      }
    })
    .catch((err: any) => {
      console.log(err);
      return null;
    });
  }

  async getSessionUser(sessionid: string) : Promise<Session & { user: AppUser }> {
    return await this.prisma.session.findUnique({
      where: { id: sessionid },
      include: { user: true }
    })
    .catch((err: any) => {
      console.log(err);
      return null;
    });
  }

  async getUserSessionAchieve(sessionid: string) : Promise<AppUser & { session: Session; friends: AppUser[]; achievements: Achieve[] }> {
    return await this.prisma.appUser.findUnique({
      where: { sessionid: sessionid},
      include: {
        session: true,
        friends: true,
        achievements: true
      },
    })
    .catch((err: any) => {
      console.log(err);
      return null;
    });
  }

  //Setters

  async setNewSession(sessionid: string, ip: string, state: string) : Promise<Session> {
    return await this.prisma.session.create({
      data : {
        id: sessionid,
        ip_address: ip,
        state: state
      }
    })
    .catch((err: any) => {
      console.log(err);
      return null;
    });
  }

  async upsertUserToken(user_data: any, token: Token, session: Session) : Promise<AppUser & { token: Token, session: Session }> {
    return await this.prisma.appUser.upsert({
      where: {
        id: user_data.data.id,
      },
      create: {
        id: user_data.data.id,
        session: { connect: { id: session.id } },
        email: user_data.data.email,
        full_name: user_data.data.usual_full_name,
        token : { 
          create: token
        }
      },
      update: {
        token: {
          update: token
        }
      },
      include: {
        token: true,
        session: true,
      },
    })
    .catch((err: any) => {
      console.log(err);
      return null;
    })
  }

  async connectSession(sessionid: string, userid: number, is_2fa_active: boolean) : Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionid },
      data: {
        user: {
          connect: { id: userid }
        },
        twoFA_locked: is_2fa_active
      }
    })
    .catch((err: any) => { console.log(err) });
  }

  async setDummySession(sessionid: string, newid: string) : Promise<void> {
    await this.prisma.session.update({
      where: {
        id: sessionid,
      },
      data: {
        id: newid,
      }
    })
    .catch((err: any) => { console.log(err) });
  }

}
