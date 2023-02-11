import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Session, AppUser, Room } from '@prisma/client';
import { IRoom, IRoomAccess } from '../Interfaces';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async getRooms(sessionid: string) : Promise<Session & { user: AppUser & { rooms: IRoom[] } }> {
		const blocked_list: number[] = [];
		await this.prisma.session.findUnique({
			where: { id: sessionid },
			include: {
				user: {
					include: { blocked: true }
				}
			}
		})
		.then((session: Session & { user: AppUser & { blocked: AppUser[] } }) => {
			(session.user.blocked as AppUser[]).map((blocked_user) => {
				blocked_list.push(blocked_user.id);
			})
		})
		.catch((err: any) => {console.log(err)});
		return await this.prisma.session.findUnique({
			where: { id: sessionid },
			include: {
				user: {
					include: {
						rooms: {
							select: {
								id: true,
								participants: {
									select: {
										id: true,
										display_name: true,
										avatar: true,
										status: true
									}
								},
								administrators: {
									select: {
										id: true,
										display_name: true,
										avatar: true,
										status: true
									}
								},
								penalties: true,
								accessibility: true,
								name: true,
								messages: {
									where: {
										appUserId: { notIn: blocked_list }
									}
								}
							}
						}
					}
				}
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}

	isAdmin(aRoom: IRoom, user: AppUser & { rooms: IRoom[]; }): boolean
	{
		const res = aRoom.administrators.map((admin) => {
			if (admin.id == user.id)
				return (true);
			return (false);
		})
		if (res.includes(true))
			return (true);
		return (false);
	}

	async getSessionUser(sessionid: string) : Promise<Session & { user: AppUser }> {
		return await this.prisma.session.findUnique({
			where: { id: sessionid },
			include: {
				user: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}

	async createNewRoom(userid: number, room_name: string, password: string, access: IRoomAccess) : Promise<boolean> {
		return await this.prisma.room.create({
			data: {
				participants: {
					connect: { id: userid }
				},
				administrators: {
					connect: { id: userid }
				},
				accessibility: access,
				name: room_name,
				password: password
			}
		})
		.then(() => true)
		.catch((err: any) => {
			console.log(err);
			return false;
		})
	}
}
