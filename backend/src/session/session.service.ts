import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
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

  async findOne(id: string, ip: string): Promise<Session> {
    if (id === null || id === undefined || ip === null || ip === undefined) {
      throw new Error("Null | Undefined values cannot be used to create a database query");
    }
    return await this.sessionRepository.findOneBy({
      sessionid: id, 
      ip_address: ip,
      },
    );
  }

  async remove(id: string): Promise<void> {
    await this.sessionRepository.delete(id);
  }

  async removeEmpty(): Promise<void> {
    let to_delete: Session[] = await this.sessionRepository.find({
      where: {
        userid: IsNull(),
      },
    });
    to_delete.forEach(async (s, i) => { await this.remove(s.sessionid)});
  }

  async purgeIP(ip: string): Promise<void> {
    let to_delete: Session[] = await this.sessionRepository.find({
      where: {
        ip_address: ip,
      },
    });
    to_delete.forEach(async (s, i) => { await this.remove(s.sessionid)});
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

  async joinUser(sessionid: string) : Promise<any> {
    if (sessionid === null || sessionid === undefined) {
      throw new Error("Null | Undefined values cannot be used to create a database query");
    }
    return await this.sessionRepository
      .createQueryBuilder('session')
      .innerJoinAndSelect('session.user', 'user')
      .where('session.sessionid = :id', { id: sessionid})
      .getOne();
  }
}