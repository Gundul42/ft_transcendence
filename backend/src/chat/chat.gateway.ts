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

@WebSocketGateway(3030, { namespace: 'chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor (
		private readonly prisma: PrismaService,
		private readonly rooms: RoomsManager)
	{
		rooms.prisma = this.prisma;
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

	handleConnection(client: Socket)
	{
		client.on('join', (room: string, callback) => this.handleJoinEvent(client, room, callback));
		client.on('leave', (room: string, callback) => this.handleLeaveEvent(client, room, callback));
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

	@SubscribeMessage("join")
	async handleJoinEvent(client: Socket, room: string, callback: (val: string) => void)
	{
		const session: Session & { user: AppUser } = await this.findUser(client);
		// const user = await this.findUser(client);
		// this.prisma.appUser.findUnique({
		// 	where: {
		// 	  id: client.request.
		// 	},
		// 	include: { user: true }
		//   })
		// Validate if client can join room here
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

	@SubscribeMessage("message")
	handleMsg(@MessageBody() message : string) : void
	{
		console.log("in handling");
		console.log(message);
		this.server.emit("messageResponse", message, "hmm");
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

