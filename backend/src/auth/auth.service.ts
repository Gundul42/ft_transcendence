import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request } from "express";
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import * as oauth_info from './info.json'
import * as twofactor from 'node-2fa';
import { PrismaService } from '../prisma/prisma.service';
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
    ft_uri.append("client_id", oauth_info.client_id);
    ft_uri.append("redirect_uri", oauth_info.redirect_uri);
    ft_uri.append("scope", oauth_info.scope);
    ft_uri.append("response_type", "code");
    ft_uri.append("state", state);
    return (oauth_info.ftAPI.url + oauth_info.ftAPI.auth + "?" + ft_uri.toString());
  }

  requestToken(authCode: string, clientState: string) : Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.post(oauth_info.ftAPI.url + oauth_info.ftAPI.token, {
      grant_type : 'authorization_code',
      client_id : oauth_info.client_id,
      client_secret : oauth_info.secret,
      code : authCode,
      redirect_uri : oauth_info.redirect_uri,
      state : clientState
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  requestData(access_token: string) : Promise<AxiosResponse<any>> {
    return this.httpService.axiosRef.get(oauth_info.ftAPI.url + oauth_info.ftAPI.user_data, {
      headers : {
        'Authorization': 'Bearer ' + access_token
      }
    })
  }

  async deactivate2FA(userid: number) {
    await this.prisma.appUser.update({
      where: { id: userid },
      data: {
        twoFA: false,
        twoFA_token: { delete: true }
      }
    })
  }

  async record2FA(userid: number, token: string) {
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

  async generateJwt(user_name: string, user_id: number): Promise<any> {
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
      function(value) {
        if (value == null || value.user == null || value.user.id == null) {
          console.log("Session does not exist");
          throw new UnauthorizedException();
        } else {
          return true;
        }
      },
      function(error) {
        console.log(error);
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
      async (value) => {
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
            });
          } else {
            console.log("2 FActor Authentication is active for this account");
            throw new ForbiddenException();
          }
        }
        return (true);
      },
      (err) => {
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
      function(value) {
        if (url_request.searchParams.get('state') === null) {
          console.log("URL is missing authentication data");
          throw new UnauthorizedException();
        }
        else if (value === null || value.state === null) {
          console.log("Session was registered incorrectly");
          throw new UnauthorizedException();
        }
        else if (value.state != url_request.searchParams.get('state')?.replace(/\\$/g, '')) {
          console.log("Third party request");
          throw new UnauthorizedException();
        }
        return true;
      },
      function(error) {
        console.log(error);
        throw new UnauthorizedException();
      }
    )
  }
}
