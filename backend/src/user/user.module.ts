import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUserService } from './user.service';
import { AppUser } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppUser])],
  providers: [AppUserService],
  exports: [AppUserService]
})
export class AppUserModule {}
