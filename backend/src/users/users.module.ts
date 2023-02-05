import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [UsersController],
  providers: [UsersService, AuthService, JwtService],
})
export class UsersModule {}
