// import { Rooms } from './rooms';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { Room, Session, AppUser } from '@prisma/client';
import { IRoomAccess } from '../../Interfaces';

export class RoomsManager {
	public server: Server;
	public counter = 0;

	constructor(public prisma: PrismaService)
	{
		
	}

	async checkRoomStatus(room: string) : Promise<boolean>
	{
		const exists = await this.prisma.room.findFirst({
			where: { name: room	},
			});
		if (exists === null)
			return true;
		if (exists.accessibility == IRoomAccess.Private)
			return false;
		//  check if doesn't exist
		//	check if pass protected, if yes, check pass
		return (false);
	}

	async findRoom(client: Socket, user: AppUser, name: string) : Promise<Room | null>
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

	async makeRoom(client: Socket, user: AppUser, name: string) : Promise<Room | null>
	{
		const result = await this.prisma.room.create({
		  data: {
			participants: {
				connect: { id: user.id }
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
		await this.prisma.appUser.update(
			{
				where: {
					id: user.id,
				},
				data:
				{
					rooms: {connect: { id: result.id }},
				}
			}
		)
		return result;
	}
}