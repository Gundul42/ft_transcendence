import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { AppUser } from '../user/user.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  findAll(): Promise<Session[]> {
    return this.sessionRepository.find();
  }

  findOne(id: string, ip: string): Promise<Session> {
    return this.sessionRepository.findOneBy({
      sessionid: id, 
      ip_address: ip,
      },
    );
  }

  async remove(id: string): Promise<void> {
    await this.sessionRepository.delete(id);
  }

  async add(sessionid: string, user: AppUser | null, ip_address: string | null, created_on: Date, state: string) : Promise<void> {
    const session = new Session;
    session.sessionid = sessionid;
    session.user = user;
    session.ip_address = ip_address;
    session.created_on = created_on;
    session.state = state;
    await session.save();
  }
}
