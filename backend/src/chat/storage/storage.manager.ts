import { PrismaService } from '../../prisma/prisma.service';
import { Room, AppUser, Message } from '@prisma/client';
import { IMessage, IUserPublic } from '../../Interfaces';

export class StorageManager {

	constructor(public prisma: PrismaService) {}

	toIMessage(message: (Message & { sender: AppUser | null; room: Room | null; })) : IMessage {
		var ret: IMessage = {
			value: message.value,
			uname: message.sender?.display_name,
			id: message.id,
			room: message.room?.name,
			appUserId: message.appUserId
		};
		return ret;
	}

	toIMessages(message: (Message & { sender: AppUser | null; room: Room | null; })[]) : IMessage[] {
		const ret: IMessage[] = message.map((x) => {
			return {
				value: x.value,
				uname: x.sender?.display_name,
				id: x.id,
				room: x.room?.name,
				appUserId: x.appUserId
			};
		});
		return (ret);
	}

	async loadMessages(client: AppUser) : Promise<IMessage[] | null> {
		if (client === undefined) {
			return null;
		}
		const dbret = await this.prisma.message.findMany({
			where: { sender: client },
			include: {
				sender: true,
				room: true
			}
		})
		.catch((err: any) => {
			console.log(err);
			return [];
		})
		return (this.toIMessages(dbret));
	}

	async saveMessage(message: string, client: IUserPublic, room: Room) : Promise<Message & { sender: AppUser, room: Room }> {
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
		.catch((err: any) => {
			console.log(err);
			return null;
		})
	}
}
