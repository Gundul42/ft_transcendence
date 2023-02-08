import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { Room, Session, AppUser, Message } from '@prisma/client';
import { IRoomAccess, IMessage } from '../../Interfaces';

export class StorageManager {
	// public server: Server;

	constructor(public prisma: PrismaService)
	{
		
	}

	toIMessage(message: (Message & { sender: AppUser | null; room: Room | null; })) : IMessage
	{
		var ret: IMessage = {
			text: message.value,
			uname: message.sender?.display_name,
			id: message.id,
			socketID: message.sender?.id,
			room: message.room?.name
		};
		return ret;
	}

	toIMessages(message: (Message & { sender: AppUser | null; room: Room | null; })[]) : IMessage[]
	{
		const ret: IMessage[] = message.map((x) => {
			return {
				text: x.value,
				uname: x.sender?.display_name,
				id: x.id,
				socketID: x.sender?.id,
				room: x.room?.name
			};
		  });
		return (ret);
	}

	async loadMessages(client: AppUser) : Promise<IMessage[] | null>
	{
		if (client === undefined)
			return null;
		const dbret = await this.prisma.message.findMany(
			{
				where:
				{
					sender: client
				},
				include:
				{
					sender: true,
					room: true
				}
			}
		);
		return (this.toIMessages(dbret));
	}

	async saveMessage(message: string, client: AppUser, room: Room)
	{
		if (client === undefined)
			return null;
		return await this.prisma.message.create(
			{
				data: {
					sender: 
					{
						connect: { id: client.id }
					},
					value: message,
					room:
					{
						connect: {id: room.id}
					}
				},
				include:
				{
					sender: true,
					room: true
				}
			}
		)
	}
}