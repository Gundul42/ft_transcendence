// import { Rooms } from './rooms';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { Room, Session, AppUser, Penalty } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { IRoom, IRoomAccess, IUserPublic, IPenaltyType } from '../../Interfaces';
import { AuthenticatedSocketChat } from '../AuthenticatedSocketChat';

export class RoomsManager {
	public server: Server;
	public counter = 0;

	constructor(public prisma: PrismaService)
	{
	}

	async checkRoomStatus(room: string[], client: AuthenticatedSocketChat) : Promise<boolean>
	{
		if (room === undefined)
			return false;
		const exists = await this.prisma.room.findFirst({
			where: { name: room[0] },
			include: {
				penalties: true
			}
			});
		if (exists === null) {
			await this.makeRoom(client, room[0])
			return true;
		}
		if (this.bannedFromRoom(exists, client) === true)
			return false;
		if (exists.accessibility === IRoomAccess.Public) {
			await this.joinRoom(client, room[0]);
			return true;
		}
		else if (exists.accessibility == IRoomAccess.Private)
			return false;
		else if (exists.accessibility == IRoomAccess.PassProtected)
		{
			if (room.length === 1)
				return false;
			var passprot = await this.prisma.room.findFirst(
				{
					where:
					{
						name: room[0]
					}
				})
			if (passprot?.password !== room[1])
				return (false);
			await this.joinRoom(client, room[0]);
			return true;
		}
		console.log("Joining not permitted");
		//  check if doesn't exist
		//	check if pass protected, if yes, check pass
		return (false);
	}

	bannedFromRoom(room: Room & { penalties: Penalty[];}, user: AuthenticatedSocketChat): boolean
	{
		if (room.penalties.map((penalty) => {
			if (penalty.userid === user.data.id && penalty.type === IPenaltyType.Ban)
				return (true);
			return (false);
		}).includes(true))
			return (true);
		return (false);
	}

	async findRoom(user: IUserPublic, name: string) : Promise<Room & { penalties: Penalty[];} | null>
	{
		return await this.prisma.room.findFirst(
			{
				where:
				{
					participants:{
						some: { id: user.id }
					},
					name: name
					// need to check if the user belongs or not
				},
				include:
				{
					penalties: true
				}
			}
		)
	}

	async findUserRooms(userid: number) : Promise<IRoom[]> {
		return await this.prisma.appUser.findUnique({
			where: { id: userid },
			include: {
				rooms: {
					select: {
						name: true
					}
				}
			}
		})
		.then((user) => user.rooms)
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}

	async makeRoom(client: AuthenticatedSocketChat, name: string) : Promise<Room | null>
	{
		const result: Room = await this.prisma.room.create({
		  data: {
			participants: {
				connect: { id: client.data.id }
			},
			administrators: {
				connect: { id: client.data.id }
			},
			name: name,
			accessibility: IRoomAccess.Public
		  }
		})
		.catch((err: any) => {
		  console.log(err);
		  return null;
		});
		if (result === null)
			return (null)
		client.join(name);
		/*await this.prisma.appUser.update(
			{
				where: {
					id: user.id,
				},
				data:
				{
					rooms: {connect: { id: result.id }},
				}
			}
		)*/
		return result;
	}

	async joinRoom(client: AuthenticatedSocketChat, name: string) : Promise<Room | null>
	{
		const result: Room = await this.prisma.room.update({
			where: { name: name },
			data: {
				participants: {
					connect: { id: client.data.id }
			}
		  }
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
		if (result !== null) {
			client.join(name);
		}
		return result;
	}

	public initialiseSocket(client: AuthenticatedSocketChat, user: AppUser) : void {
		client.data = {
			id: user.id,
			display_name: user.display_name,
			avatar: user.avatar,
			status: user.status
		}
	}

	public getSocketFromNamespace(userid: number) : AuthenticatedSocketChat {
		const clients: AuthenticatedSocketChat[] = Array.from((this.server.sockets as any), socket => socket[1]) as AuthenticatedSocketChat[];
		if (clients.filter(client => client.data.id === userid).length === 0) {
			return null;
		} else {
			return clients.filter(client => client.data.id === userid)[0];
		}
	}

	public async upsertDMRoom(client: AuthenticatedSocketChat, other_id: number) : Promise<IRoom> {
		const room: IRoom = await this.prisma.room.findFirst({
			where: {
				AND: [
					{
						administrators: {
							some: { id: client.data.id }
						}
					},
					{
						administrators: {
							some: { id: other_id }
						}
					},
					{
						accessibility: 3
					}
				]
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
				messages: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});

		if (room !== null) {
			return (room);
		} else {
			return await this.prisma.room.create({
				data: {
					participants: {
						connect: [{ id: client.data.id }, { id: other_id }]
					},
					administrators: {
						connect: [{ id: client.data.id }, { id: other_id }]
					},
					accessibility: 3,
					name: uuidv4(),
					password: "",
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
					messages: true
				}
			})
			.catch((err: any) => {
				console.log(err);
				return null;
			});
		}
	}

	async changePassword(room: IRoom, password: string)
	{
		await this.prisma.room.update({
			where: { name: room.name },
			data: {
				password: password,
				accessibility: IRoomAccess.PassProtected
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
		console.log("Password changed!")
	}

	async removePassword(room: IRoom)
	{
		await this.prisma.room.update({
			where: { name: room.name },
			data: {
				password: "",
				accessibility: IRoomAccess.Public
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
		console.log("Password removed!")
	}

	async promoteToAdmin(room: IRoom, user: IUserPublic)
	{
		await this.prisma.room.update({
			where: { name: room.name },
			data: {
				administrators: {
					connect: { id: user.id }
				},
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
		console.log("User promoted to admin!")
	}

	async addUserToRoom(userid: number, room_name: string) : Promise<IRoom> {
		return await this.prisma.room.update({
			where: { name: room_name },
			data: {
				participants: {
					connect: { id: userid }
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
				messages: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
	}

	async makePenalty(userId: number, room: IRoom, type: IPenaltyType)
	{
		return await this.prisma.penalty.create({
			data: {
			  user: {
				  connect: { id: userId }
			  },
			  room: {
				  connect: { id: room.id }
			  },
			  type: type,
			}
		  })
		  .catch((err: any) => {
			console.log(err);
			return null;
		  });
	}
	
	// Connects the penalty to the room, disconnects the user from it
	async addDcPenaltyToUser(penalty: Penalty, userId: number, room: IRoom)
	{
		return await this.prisma.room.update({
			where: { name: room.name },
			data: {
				participants: {
					disconnect: {id: userId}
				},
				administrators: {
					disconnect: {id: userId}
				},
				penalties: {
					connect: {id: penalty.id}
				}
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}


	async addPenaltyToUser(penalty: Penalty, userId: number, room: IRoom)
	{
		return await this.prisma.room.update({
			where: { name: room.name },
			data: {
				penalties: {
					connect: {id: penalty.id}
				}
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
	}

	async kickUser(userId: number, room: IRoom)
	{
		const penalty: Penalty = await this.makePenalty(userId, room, IPenaltyType.Kick);
		if (penalty === null)
			return null;
		if (await this.addDcPenaltyToUser(penalty, userId, room) !== null)
			console.log(userId, " has been kicked!");
	}

	async banUser(userId: number, room: IRoom)
	{
		const penalty: Penalty = await this.makePenalty(userId, room, IPenaltyType.Ban);
		if (penalty === null)
			return null;
		if (await this.addDcPenaltyToUser(penalty, userId, room) !== null)
			console.log(userId, " has been banned!");
	}

	async muteUser(userId: number, room: IRoom)
	{
		const penalty: Penalty = await this.makePenalty(userId, room, IPenaltyType.Mute);
		if (penalty === null)
			return null;
		if (await this.addPenaltyToUser(penalty, userId, room) !== null)
			console.log(userId, " has been muted!");
	}

	isMuted(room: Room & { penalties: Penalty[];}, user: AuthenticatedSocketChat): boolean
	{
		if (room.penalties.map((penalty) =>
		{
			if (penalty.userid === user.data.id && penalty.type === IPenaltyType.Mute)
				return (true);
		}).includes(true))
			return (true)
		return (false);
	}
}