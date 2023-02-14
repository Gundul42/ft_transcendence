// import { Rooms } from './rooms';
import { Server } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { Room, AppUser, Penalty } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { IRoom, IRoomAccess, IUserPublic, IPenaltyType } from '../../Interfaces';
import { AuthenticatedSocketChat } from '../AuthenticatedSocketChat';

export class RoomsManager {
	public server: Server;
	public counter = 0;

	constructor(public prisma: PrismaService) {}

	async checkRoomStatus(room: string[], client: AuthenticatedSocketChat) : Promise<boolean>
	{
		if (room === undefined || room.length === 0)
			return false;
		const exists = await this.prisma.room.findFirst({
			where: { name: room[0] },
			include: { penalties: true }
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
			var passprot = await this.prisma.room.findFirst({
				where: { name: room[0] }
			})
			.catch((err: any) => {
				console.log(err);
				return null;
			})
			if (passprot === null || !bcrypt.compareSync(room[1], passprot.password))
				return (false);
			await this.joinRoom(client, room[0]);
			return true;
		}
		console.log("Joining not permitted");
		//  check if doesn't exist
		//	check if pass protected, if yes, check pass
		return (false);
	}

	bannedFromRoom(room: Room & { penalties: Penalty[];}, user: AuthenticatedSocketChat): boolean {
		if (room.penalties.map((penalty) => {
			if (penalty.userid === user.data.id && penalty.type === IPenaltyType.Ban)
				return (true);
			return (false);
		}).includes(true))
			return (true);
		return (false);
	}

	async findRoom(user: IUserPublic, name: string) : Promise<Room & { penalties: Penalty[];} | null> {
		return await this.prisma.room.findFirst({
			where: {
				participants:{
					some: { id: user.id }
				},
				name: name
				// need to check if the user belongs or not
			},
			include: { penalties: true }
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
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
		.then((user: AppUser & { rooms: Room[] }) => user.rooms)
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}

	async findAccessibleRoom(userid: number, room_name: string) : Promise<IRoom> {
		return await this.prisma.room.findFirst({
			where: {
				name: room_name,
				OR: [
					{
						accessibility: { not: IRoomAccess.Private }
					},
					{
						participants: {
							some: { id: userid }
						}
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
				messages: true,
				ownerId: true,
				owner: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}

	async findRecordRoom(room_name: string) : Promise<IRoom> {
		return await this.prisma.room.findFirst({
			where: { name: room_name },
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
				owner: true,
				ownerId: true,
				penalties: true,
				accessibility: true,
				name: true,
				messages: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}

	async makeRoom(client: AuthenticatedSocketChat, name: string) : Promise<Room | null> {
		const result: Room = await this.prisma.room.create({
			data: {
				participants: {
					connect: { id: client.data.id }
				},
				administrators: {
					connect: { id: client.data.id }
				},
				owner: {
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
		if (result !== null) {
			client.join(name);
		}
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
		try {
			const clients: AuthenticatedSocketChat[] = Array.from((this.server.sockets as any), socket => socket[1]) as AuthenticatedSocketChat[];
			if (clients.filter(client => client.data.id === userid).length === 0) {
				return null;
			} else {
				return clients.filter(client => client.data.id === userid)[0];
			}
		} catch (err: any) {
			console.log(err);
			return null;
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
					owner: {
						connect: {id: client.data.id}
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
					messages: true,
					owner: true
				}
			})
			.catch((err: any) => {
				console.log(err);
				return null;
			});
		}
	}

	async changePassword(room: IRoom, password: string) : Promise<void> {
		await this.prisma.room.update({
			where: { name: room.name },
			data: {
				password: bcrypt.hashSync(password, 10),
				accessibility: IRoomAccess.PassProtected
			}
		})
		.then(() => {console.log("Password changed!")})
		.catch((err: any) => {console.log(err)})
	}

	async removePassword(room: IRoom) : Promise<void> {
		await this.prisma.room.update({
			where: { name: room.name },
			data: {
				password: "",
				accessibility: IRoomAccess.Public
			}
		})
		.then(() => {console.log("Password removed!")})
		.catch((err: any) => {console.log(err)});
	}

	async promoteToAdmin(room: IRoom, user: IUserPublic) : Promise<void> {
		await this.prisma.room.update({
			where: { name: room.name },
			data: {
				administrators: {
					connect: { id: user.id }
				},
			}
		})
		.then(() => {console.log("User promoted to admin!")})
		.catch((err: any) => {console.log(err)});
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
				messages: true,
				owner: true,
				ownerId: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
	}

	async makePenalty(userId: number, room: IRoom, type: IPenaltyType, time: number) : Promise<Penalty> {
		const penalty: Penalty = await this.prisma.penalty.create({
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
		if (penalty === null)
		  return;
		setTimeout(async (penalty: Penalty) => {
			await this.prisma.penalty.delete({
				where: {
					id: penalty.id
				}
			})
			.catch((err: any) => {console.log(err)})
			console.log("Penalty has been lifted!");
		}, time * 60000, penalty);
		return (penalty);
	}
	
	// Connects the penalty to the room, disconnects the user from it
	async addDcPenaltyToUser(penalty: Penalty, userId: number, room: IRoom): Promise<IRoom> {
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
			},
			select:
			{
				name: true,
				participants: true,
				administrators: true,
				owner: true,
				ownerId: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}

// Change name to addPenaltyToRoom?
	async addPenaltyToUser(penalty: Penalty, userId: number, room: IRoom) : Promise<Room> {
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

	async kickUser(userId: number, room: IRoom) : Promise<IRoom | null> {
		const penalty: Penalty = await this.makePenalty(userId, room, IPenaltyType.Kick, 1);
		if (penalty === null)
			return null;
		return (await this.addDcPenaltyToUser(penalty, userId, room));
	}

	async banUser(userId: number, room: IRoom, number: number) : Promise<IRoom | null> {
		const penalty: Penalty = await this.makePenalty(userId, room, IPenaltyType.Ban, number);
		if (penalty === null)
			return null;
		return (await this.addDcPenaltyToUser(penalty, userId, room));
	}

	async muteUser(userId: number, room: IRoom, number: number) : Promise<void> {
		const penalty: Penalty = await this.makePenalty(userId, room, IPenaltyType.Mute, number);
		if (penalty === null)
			return ;
		if (await this.addPenaltyToUser(penalty, userId, room) !== null)
			console.log(userId, " has been muted!");
	}

	async classifyUser(userid: number, room_name: string) : Promise<number> {
		const room: IRoom = await this.prisma.room.findUnique({
			where: { name: room_name },
			include: {
				participants: true,
				administrators: true,
				owner: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		})
		if (room === null || room.participants.filter((participant) => participant.id === userid).length === 0 || room.accessibility === IRoomAccess.DirectMessage) {
			throw new Error("Request is not valid")
		} else if (room.owner.id === userid) { console.log("was owner")
			return 2;
		} else if (room.administrators.filter((admin) => admin.id === userid).length > 0) {
			return 1;
		} else {
			return 0;
		}
	}

	async removeParticipant(client: AuthenticatedSocketChat, room_name: string) : Promise<void> {
		await this.prisma.room.update({
			where: { name: room_name },
			data: {
				participants: {
					disconnect: { id: client.data.id }
				}
			}
		})
		.then(() => {client.leave(room_name)})
		.catch((err: any) => {console.log(err)});
	}

	async removeAdmin(userid: number, room_name: string) : Promise<void> {
		await this.prisma.room.update({
			where: { name: room_name },
			data: {
				administrators: {
					disconnect: { id: userid }
				}
			}
		})
		.catch((err: any) => {console.log(err)});
	}

	async removeOwner(userid: number, room_name: string) : Promise<void> {
		const currentAdmins = await this.prisma.room.findFirst({
			where: {name: room_name},
			include: {
				administrators: true,
				participants: true
			}
		})
		var newOwner: AppUser;
		if (currentAdmins?.administrators.length === 0) {
			console.log("no admins found")
			newOwner = currentAdmins.participants[0];
		} else {
			newOwner = currentAdmins.administrators[0];
		}
		console.log(newOwner);
		if (newOwner === undefined)
			return ;
		await this.prisma.room.update({
			where: { name: room_name },
			data: {
				owner: {
					connect: { id: newOwner.id }
				},
				administrators: {
					connect: { id: newOwner.id }
				}
			}
		})
		.catch((err: any) => {console.log(err)});
	}

	isMuted(room: Room & { penalties: Penalty[];}, user: AuthenticatedSocketChat): boolean {
		if (room.penalties.map((penalty) =>
		{
			if (penalty.userid === user.data.id && penalty.type === IPenaltyType.Mute)
				return (true);
		}).includes(true))
			return (true)
		return (false);
	}
}
