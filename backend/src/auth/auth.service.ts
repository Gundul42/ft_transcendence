import { Injectable } from '@nestjs/common';
import * as oauth_info from './info.json'

@Injectable()
export class AuthService {
  alphanum(n : number) : string {
    let res = "";
    for (let i = 0; i < n; i++) {
      res += String.fromCharCode(32 + Math.floor(Math.random() * 94));
    }
    return (res);
  }
  getLink(): string {
    const ft_uri = new URLSearchParams("");
    ft_uri.append("client_id", oauth_info.client_id);
    ft_uri.append("redirect_uri", oauth_info.redirect_uri);
    ft_uri.append("scope", oauth_info.scope);
    ft_uri.append("response_type", "code");
    ft_uri.append("state", this.alphanum(20));
    return (oauth_info.ftAPI.url + oauth_info.ftAPI.auth + "?" + ft_uri.toString());
  }
}
