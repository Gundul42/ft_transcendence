import { WebSocketGateway,
	MessageBody, 
	SubscribeMessage, 
	OnGatewayInit, 
	OnGatewayConnection, 
	OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { Session, AppUser } from '@prisma/client';
import { RoomsManager } from './rooms/rooms.manager';
import { StorageManager } from './storage/storage.manager';
import { IMessage, IRoom } from '../Interfaces';
import { AuthenticatedSocketChat } from './AuthenticatedSocketChat';

@WebSocketGateway(3030, { namespace: 'chat' , transports: ['polling', 'websocket']})
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

	afterInit(server: Server)
	{
		this.rooms.server = server;
		/*
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
		*/
	}

	async sendLog(client: Socket, callback: (val: string) => void)
	{
		const session = await this.findUser(client);
		const backlog = await this.storage.loadMessages(session?.user);
		console.log("about to emit");
		this.rooms.server.emit("connection",
			backlog
		);
	}

	async handleConnection(client: Socket, ...args: any[]) : Promise<void>
	{
		console.log("connection is being handled")
		if (!client.handshake.headers || !client.handshake.headers.cookie) {
			client.disconnect(true);
			return ;
		}
		const sessionid: string = (client.handshake.headers.cookie as string).slice((client.handshake.headers.cookie as string).indexOf("ft_transcendence_sessionId=") + "ft_transcendence_sessionId=".length);
		const session_user: Session & { user: AppUser} = await this.prisma.session.findUnique({
			where: { id: sessionid },
			include: { user: true }
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
		if (session_user === null || session_user.user === null) {
			client.disconnect(true);
			return ;
		}
		this.rooms.initialiseSocket(client as AuthenticatedSocketChat, session_user.user);
		const user_rooms: IRoom[] = await this.rooms.findUserRooms(client.data.id);
		if (user_rooms !== null && user_rooms.length > 0) {
			user_rooms.forEach((value) => {
				client.join(value.name)
			})
		}
		console.log(session_user.user.display_name, " just connected");
		/*
		console.log("chat gateway", client.id);
		client.on('join', (room: string, callback) => this.handleJoinEvent(client, room, callback));
		client.on('leave', (room: string, callback) => this.handleLeaveEvent(client, room, callback));
		client.on('message', (message: IMessage, callback) => this.handleMsg(client, message, callback));
		client.on('connection', (callback) => this.sendLog(client, callback));
		
		// this.prisma.appUser*/
	}

	handleDisconnect(client: AuthenticatedSocketChat)
	{
		console.log(client.data.display_name, " is leaving")
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
	async handleJoinEvent(client: AuthenticatedSocketChat, data: {text: string[]}, callback: (val: string) => void)
	{
		console.log(data.text);
		if (await this.rooms.checkRoomStatus(data.text, client) == false)
		{
			console.log("not allowed");
			if (callback)
				callback("You can't join this room; provide pass if required")
			return ;
		}
		
		console.log("joining room", data.text[0]);
		// const res = await this.rooms.makeRoom(client, client.data, data.text[0]);
		// if (res != null)
		// 	console.log("room creation succesful");
		// client.join(room);
		if (callback)
			callback(`joined: ${data.text[0]}`);
		this.rooms.server.emit("newRecipientResponse", data.text[0]);
	}

	async handleLeaveEvent(client: Socket, room: string, callback)
	{
		console.log("left the room");
		client.leave(room);
		callback(`left: ${room}`);
	}

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
	async handleMsg(client: AuthenticatedSocketChat, data: {text: string, room: string}, callback: (val: string) => void)
	{
		console.log("in handling");
		console.log(client.data, data)
		if (data.room === undefined)
		{
			console.log("no roomless msg allowed");
			if (callback)
				callback("Join a room first!");
			return ;
		}
		//const session: Session & { user: AppUser } = await this.findUser(client);
		const toRoom = await this.rooms.findRoom(client.data, data.room)
		if (toRoom === null)
		{
			if (callback)
				callback("You don't belong in the specified room");
			return ;
		}
		// if (this.storage.)
		// console.log(client);
		console.log(data.text, " to ", toRoom?.name);
		const msg = await this.storage.saveMessage(data.text, client.data, toRoom);
		this.rooms.server.emit("messageResponse", this.storage.toIMessage(msg));
		// this.server.emit("messageResponse", 
		// 	{
		// 		text: message, 
		// 		name: "Server", 
		// 		id: 124234,
		// 		socketID: 425669384756client
		// 	});
	}

	@SubscribeMessage("dm")
	async directMessage(client: AuthenticatedSocketChat, data: {other_id: number}) : Promise<string> {
		const room: IRoom = await this.rooms.upsertDMRoom(client, data.other_id);
		if (room === null) {
			return ("");
		}
		client.join(room.name);
		const client2: AuthenticatedSocketChat = this.rooms.getSocketFromNamespace(data.other_id);
		if (client2 !== null) {
			client2.join(room.name);
		}
		this.rooms.server.to(room.name).emit("roomUpdate", { roomid: room.id, room: room });
		return (room.name);
	}

	@SubscribeMessage("ping")
	pong(@MessageBody() message : string) : void
	{
		console.log("pong ", message);
		this.rooms.server.emit("pong");
	}
	// Add methods for handling events here
}

