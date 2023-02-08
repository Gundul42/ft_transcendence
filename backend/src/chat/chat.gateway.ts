import { UseGuards, Res, Req, Param } from '@nestjs/common';
import { WebSocketGateway, 
	WebSocketServer, 
	MessageBody, 
	SubscribeMessage, 
	OnGatewayInit, 
	OnGatewayConnection, 
	OnGatewayDisconnect, 
	WsException} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ParsedUrlQuery } from 'querystring';
import { PrismaService } from '../prisma/prisma.service';
import { Room, Session, AppUser } from '@prisma/client';
import { RoomsManager } from './rooms/rooms.manager';
import { StorageManager } from './storage/storage.manager';
import { IMessage } from '../Interfaces';

@WebSocketGateway(3030, { namespace: 'chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor (
		private readonly prisma: PrismaService,
		private readonly rooms: RoomsManager,
		private readonly storage: StorageManager
		)
	{
		rooms.prisma = this.prisma;
		storage.prisma = this.prisma;
	}

	@WebSocketServer() server: Server;

	afterInit(server: Server)
	{
		server.use(async (socket: Socket, next) => {
			const req = socket.request.headers.cookie;
			console.log('Req: ', req);
			// const query = socket.handshake.query;
			// console.log("Query: ", query);
			if (await this.isValid(req)) {
				console.log("Auth successful");
				
				next();
				return;
			}
			console.log("Auth failed");
			return next(new Error("401"));
		});
	}
	async sendLog(client: Socket, callback: (val: string) => void)
	{
		const session = await this.findUser(client);
		const	backlog = await this.storage.loadMessages(session?.user);
		console.log("about to emit");
		this.server.emit("connection",
			backlog
		);
	}

	async handleConnection(client: Socket)
	{
		client.on('join', (room: string, callback) => this.handleJoinEvent(client, room, callback));
		client.on('leave', (room: string, callback) => this.handleLeaveEvent(client, room, callback));
		client.on('message', (message: IMessage, callback) => this.handleMsg(client, message, callback));
		client.on('connection', (callback) => this.sendLog(client, callback));
		
		// this.prisma.appUser
	}

	handleDisconnect(client: Socket)
	{
		this.leaveAllRooms(client);
	}

	async leaveAllRooms(client: Socket)
	{

	}

	async findUser(client: Socket) : Promise<(Session & { user: AppUser | null}) | null>
	{
		return await this.prisma.session.findUnique({
			where: {
			  id: client.request.headers.cookie.slice('ft_transcendence_sessionId'.length + 1),
			},
			include: { user: true }
			})
			.catch((err: any) => {
			  console.log(err);
			  return null;
			});
	}

	// @SubscribeMessage("join")
	async handleJoinEvent(client: Socket, room: string, callback: (val: string) => void)
	{
		console.log(client);
		const session: Session & { user: AppUser } = await this.findUser(client);
		// const user = await this.findUser(client);
		// this.prisma.appUser.findUnique({
		// 	where: {
		// 	  id: client.request.
		// 	},
		// 	include: { user: true }
		//   })
		// Validate if client can join room here
		if (await this.rooms.checkRoomStatus(room) == false)
		{
			console.log("not allowed");
			return ;
		}
		
		console.log("joining room", room);
		console.log(session.user);
		const res = await this.rooms.makeRoom(client, session.user, room);
		if (res != null)
			console.log("room creation succesful");
		// client.join(room);
		if (callback)
			callback(`joined: ${room}`);
		this.server.emit("newRecipientResponse", room);
	}

	async handleLeaveEvent(client: Socket, room: string, callback)
	{
		console.log("left the room");
		client.leave(room);
		callback(`left: ${room}`);
	}

	// @UseGuards(AuthGuard)
	async isValid(query : string | undefined): Promise<boolean>
	{
		if (query == undefined)
			return false;
		console.log("Cookie: ", query.slice('ft_transcendence_sessionId'.length + 1));
		if (!query.startsWith('ft_transcendence_sessionId')) {
			return false;
		  }
		  return await this.prisma.session.findUnique({
			where: {
			  id: query.slice('ft_transcendence_sessionId'.length + 1),
			},
			include: { user: true }
		  })
		  .then(
			(value: Session & { user: AppUser }) => {
			  if (value == null || value.user == null || value.user.id == null) {
				console.log("Session does not exist");
				return false;
			  }
			  else {
				return true;
			  }
			},
			(err: any) => {
			  console.log(err);
			  return false;
			}
		  )
	}

	// @SubscribeMessage("message")
	async handleMsg(client: Socket, message: IMessage, callback: (val: string) => void)
	{
		console.log("in handling");
		if (message.room === undefined)
		{
			console.log("no roomless msg allowed");
			if (callback)
				callback("Join a room first!");
			return ;
		}
		const session: Session & { user: AppUser } = await this.findUser(client);
		const toRoom = await this.rooms.findRoom(client, session.user, message.room)
		if (toRoom === null)
		{
			if (callback)
				callback("You don't belong in the specified room");
			return ;
		}
		// if (this.storage.)
		// console.log(client);
		console.log(message.text, " to ", toRoom?.name);
		const msg = await this.storage.saveMessage(message.text, session.user, toRoom);
		this.server.emit("messageResponse", this.storage.toIMessage(msg));
		// this.server.emit("messageResponse", 
		// 	{
		// 		text: message, 
		// 		name: "Server", 
		// 		id: 124234,
		// 		socketID: 425669384756
		// 	});
	}

	@SubscribeMessage("ping")
	pong(@MessageBody() message : string) : void
	{
		console.log("pong ", message);
		this.server.emit("pong");
	}
	// Add methods for handling events here
}

