// import { Rooms } from './rooms';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { Room, Session, AppUser } from '@prisma/client';

export class RoomsManager {
	public server: Server;
	public counter = 0;

	constructor(private readonly prisma: PrismaService)
	{
		
	}

	async makeRoom(client: Socket, user: AppUser, name: string) : Promise<Room> {
		const result = await this.prisma.room.create({
		  data : {
			participants:{
				connect: user
			},
			name: name,
		  }
		})
		.catch((err: any) => {
		  console.log(err);
		  return null;
		});
		if (result != null)
			client.join(name);
		return result;
	}
}