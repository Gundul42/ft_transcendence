import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller("api/auth")
export class AuthController {
  constructor(private readonly appService: AuthService) {}

  @Get("signup")
  getLink(): string {
    return this.appService.getLink();
  }

  @Get("signin")
  verify(): string {
    return "verifying session Id";
  }
}
