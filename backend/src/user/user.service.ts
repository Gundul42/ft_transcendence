import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppUser } from './user.entity';

@Injectable()
export class AppUserService {
  constructor(
    @InjectRepository(AppUser)
    private userRepository: Repository<AppUser>,
  ) {}

  findAll(): Promise<AppUser[]> {
    return this.userRepository.find();
  }

  findOne(id: string): Promise<AppUser> {
    return this.userRepository.findOneBy({
      userid: id
      },
    );
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async add(userid: string, email: string, full_name: string, access_token: string, token_type: string, expires_in: number, refresh_token: string, scope: string, created_at: number) : Promise<AppUser> {
    const user = new AppUser;
    user.userid = userid;
    user.email = email;
    user.full_name = full_name;
    user.access_token = access_token;
    user.token_type = token_type;
    user.expires_in = expires_in;
    user.refresh_token = refresh_token;
    user.scope = scope;
    user.created_at = created_at;
    await user.save();
    return user;
  }
}
