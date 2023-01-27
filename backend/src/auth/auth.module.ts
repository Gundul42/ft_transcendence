import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import * as oauth_info from './info.json'

@Module({
  imports: [
    HttpModule,
    PassportModule,
    JwtModule.register({ 
      secret: oauth_info.jwt_secret,
      signOptions: { expiresIn: 600 }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
