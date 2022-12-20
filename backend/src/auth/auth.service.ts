import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from "express";
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import * as oauth_info from './info.json'
import { SessionService } from '../session/session.service';
import { Session } from '../session/session.entity';

@Injectable()
export class AuthService {
  constructor (
    private sessionService: SessionService,
    private readonly httpService: HttpService ) {}

  // getIp(header: string | string[] | null) : string {
  //   if (typeof header === "null") {
  //     return "";
  //   }
  //   else if (typeof header === "string")  {
  //     return header;
  //   }
  //   else {
  //     console.log(header);
  //   }
  // }

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
      grant_type : "authorization_code",
      client_id : oauth_info.client_id,
      client_secret : oauth_info.secret,
      code : authCode,
      redirect_uri : "https://localhost/api",
      state : clientState
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Guards

  validateSession(req: Request) : boolean {
    let ret: boolean = false;
    const session: Promise<Session> = this.sessionService.findOne(req.cookies['ft_transcendence_sessionId'], '127.0.0.1');
    session.then(
      function(value) {
        if (value == null || value.userid == 0) {
          console.log("Session does not exist");
        }
        else {
          ret = true;
        }
      },
      function(error) {
        console.log(error);
      }
    )
    if (!ret) {
      throw new UnauthorizedException();
    }
    return ret;
  }

  confirmSignup(req: Request) : boolean {
    let ret: boolean = false;
    const session = this.sessionService.findOne(req.cookies['ft_transcendence_sessionId'], '127.0.0.1');
    session.then(
      function(value) {
        if (value.state != req.params.state) {
          console.log("Third party request");
          throw UnauthorizedException;
        }
        else {
          ret = true;
        }
      },
      function(error) {
        console.log(error);
        throw UnauthorizedException;
      }
    )
    return ret;
  }
}
