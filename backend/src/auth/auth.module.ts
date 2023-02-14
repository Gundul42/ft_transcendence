import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AchievementService } from '../achievement/achievement.service';

@Module({
  imports: [
    HttpModule,
    PassportModule,
    JwtModule.register({ 
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 600 }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AchievementService],
  exports: [AuthService]
})
export class AuthModule {}
