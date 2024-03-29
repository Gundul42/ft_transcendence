import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Session, AppUser, Room } from '@prisma/client';
import { IPenaltyType, IRoom, IRoomAccess } from '../Interfaces';

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async getRooms(sessionid: string) : Promise<Session & { user: AppUser & { rooms: IRoom[] } }> {
		const blocked_list: number[] = [];
		const user: AppUser = await this.prisma.session.findUnique({
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
			return (session.user);
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
		return await this.prisma.session.findUnique({
			where: { id: sessionid },
			include: {
				user: {
					include: {
						rooms: {
							where: {
								penalties: {
									none: {
										type: { in: [IPenaltyType.Ban, IPenaltyType.Kick] },
										userid: user.id
									}
								}
							},
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
								ownerId: true,
								owner: true,
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

	isAdmin(aRoom: IRoom, user: AppUser & { rooms: IRoom[]; }) : boolean {
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
				owner: {
					connect: { id: userid }
				},
				accessibility: access,
				name: room_name,
				password: bcrypt.hashSync(password, 10)
			}
		})
		.then(() => true)
		.catch((err: any) => {
			console.log(err);
			return false;
		})
	}

	async getRecordsAccessibleRooms(userid: number, partial_name: string) : Promise<Omit<Room, "password">[]> {
		return await this.prisma.room.findMany({
			where: {
				name: { contains: partial_name },
				OR: [
					{ accessibility: 0 },
					{ 
						accessibility: 1,
						participants: {
							some: { id: userid }
						}
					},
					{ accessibility: 2 }
				],
				penalties: {
					none: {
						type: { in: [IPenaltyType.Ban, IPenaltyType.Kick] },
						userid: userid
					}
				}
			},
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
				messages: true,
				owner: true,
				ownerId: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return ([]);
		})
	}

	validateForOperation(rooms: IRoom[], mbAdmin: AppUser & { rooms: IRoom[] }, targetUser: number, roomName: string) : IRoom | null {
		const results: (IRoom | null)[] = rooms.map((aRoom) =>
		{
			if (aRoom.name === roomName)
			{
				if (aRoom.accessibility === IRoomAccess.DirectMessage)
					return (null);
				if (this.isAdmin(aRoom, mbAdmin) === false)
					return (null)
				if (aRoom.owner.id === Number(targetUser))
					return (null);
				return (aRoom);
			}
			return (null);
		})
		const wasFound = results.find(value => value !== null);
		if (typeof wasFound === "object")
			return (wasFound);
		return (null);
	}
}
