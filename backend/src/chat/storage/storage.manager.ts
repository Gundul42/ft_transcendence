import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { Room, Session, AppUser, Message } from '@prisma/client';
import { IRoomAccess } from '../../Interfaces';

export class StorageManager {
	public server: Server;

	constructor(public prisma: PrismaService)
	{
		
	}

	async loadMessages()
	{
		this.prisma.message;
	}
	async saveMessage(message: string, client: Socket)
	{
		this.prisma.message.create(
			{
				data:
				{
					
				}
			}
		)
	}
}