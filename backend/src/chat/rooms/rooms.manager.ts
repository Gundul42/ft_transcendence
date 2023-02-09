// import { Rooms } from './rooms';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { Room, Session, AppUser } from '@prisma/client';
import { IRoomAccess, IUserPublic } from '../../Interfaces';
import { AuthenticatedSocketChat } from '../AuthenticatedSocketChat';

export class RoomsManager {
	public server: Server;
	public counter = 0;

	constructor(public prisma: PrismaService)
	{
		
	}

	async checkRoomStatus(room: string, client: AuthenticatedSocketChat) : Promise<boolean>
	{
		const exists = await this.prisma.room.findFirst({
			where: { name: room	},
			});
		if (exists === null) {
			await this.makeRoom(client, room)
			return true;
		} else if(exists.accessibility === IRoomAccess.Public) {
			await this.joinRoom(client, room);
			return true;
		} else if (exists.accessibility == IRoomAccess.Private) {
			return false;
		}
		//  check if doesn't exist
		//	check if pass protected, if yes, check pass
		return (false);
	}

	async findRoom(client: Socket, user: IUserPublic, name: string) : Promise<Room | null>
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
				}
			}
		)
	}

	async makeRoom(client: AuthenticatedSocketChat, name: string) : Promise<Room | null>
	{
		const result: Room = await this.prisma.room.create({
		  data: {
			participants: {
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
}