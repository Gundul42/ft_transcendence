import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from "express";
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import * as oauth_info from './info.json'
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor (
    private prisma: PrismaService,
    private readonly httpService: HttpService ) {}

  alphanum(n : number) : string {
    let res = "";
    for (let i = 0; i < n; i++) {
      res += String.fromCharCode(32 + Math.floor(Math.random() * 94));
    }
    return (res);
  }

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

  // Guards

  async validateSession(req: Request) : Promise<boolean> {
    let ret: boolean = await this.prisma.session.findUnique({
      where: {
        id: req.cookies['ft_transcendence_sessionId'],
      },
      include: { user: true }
    })
    .then(
      function(value) {
        if (value == null || value.user == null || value.user.id == null) {
          console.log("Session does not exist");
          return false;
        }
        else {
          return true;
        }
      },
      function(error) {
        console.log(error);
        return false;
      }
    )
    .catch((e) => {
      console.log(e);
      throw new UnauthorizedException();
    })
    if (!ret) {
      throw new UnauthorizedException();
    }
    return ret;
  }

  async confirmSignup(req: Request) : Promise<boolean> {
    const url_request: URL = new URL("https://localhost" + req.url);
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
