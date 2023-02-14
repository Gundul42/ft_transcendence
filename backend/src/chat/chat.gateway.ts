import { WebSocketGateway,
	MessageBody, 
	SubscribeMessage, 
	OnGatewayInit, 
	OnGatewayConnection, 
	OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { Session, AppUser, Room, Penalty } from '@prisma/client';
import { RoomsManager } from './rooms/rooms.manager';
import { StorageManager } from './storage/storage.manager';
import { IMessage, IRoom, IRoomAccess } from '../Interfaces';
import { AuthenticatedSocketChat } from './AuthenticatedSocketChat';

@WebSocketGateway(3030, { namespace: 'chat' , transports: ['polling', 'websocket']})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor (
		private readonly prisma: PrismaService,
		private readonly rooms: RoomsManager,
		private readonly storage: StorageManager,
		private authService: AuthService
		)
	{
		rooms.prisma = this.prisma;
		storage.prisma = this.prisma;
	}

	afterInit(server: Server) {
		this.rooms.server = server;
	}

	async handleConnection(client: Socket, ...args: any[]) : Promise<void> {
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
		try {
			var result: {username: string, sub: number, iat: number, exp: number} = await this.authService.verifyJwt((client.handshake.headers.authorization as string).split(' ')[1]);
		} catch (err: any) {
			console.log(err);
			client.disconnect(true);
			return ;
		}
		if (session_user === null || session_user.user === null || result.sub !== session_user.user.id) {
			console.log("Token and session do not match")
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
		console.log(session_user.user.display_name, " connected in namespace 'chat'");
	}

	handleDisconnect(client: AuthenticatedSocketChat) {
		console.log(client.data.display_name, " left namespace 'chat'");
	}

	async findUser(client: Socket) : Promise<(Session & { user: AppUser | null}) | null> {
		return await this.prisma.session.findUnique({
			where: { id: client.request.headers.cookie.slice('ft_transcendence_sessionId'.length + 1) },
			include: { user: true }
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
	}

	@SubscribeMessage("join")
	async handleJoinEvent(client: AuthenticatedSocketChat, data: {text: string[]}, callback: (val: string) => void) : Promise<void> {
		console.log(data.text);
		if (await this.rooms.checkRoomStatus(data.text, client) == false) {
			console.log("not allowed");
			if (callback)
				callback("You can't join this room; provide pass if required")
			return ;
		}
		console.log("joining room", data.text[0]);
		if (callback)
			callback(`joined: ${data.text[0]}`);
		this.rooms.server.emit("newRecipientResponse", data.text[0]);
	}

	@SubscribeMessage("message")
	async handleMsg(client: AuthenticatedSocketChat, data: {text: string, room: string}) : Promise<string | null> {
		console.log("in handling");
		console.log(client.data, data)
		if (data.room === undefined) {
			return ("Join a room first!");
		}
		const toRoom = await this.rooms.findRoom(client.data, data.room)
		if (toRoom === null) {
			return ("You don't belong in the specified room");
		} else if (this.rooms.isMuted(toRoom, client)) {
			return ("You're muted!");
		}
		console.log(data.text, " to ", toRoom?.name);
		const msg = await this.storage.saveMessage(data.text, client.data, toRoom);
		this.rooms.server.emit("messageResponse", this.storage.toIMessage(msg));
		return null;
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
		this.rooms.server.to(room.name).emit("roomUpdate", { room: room });
		return (room.name);
	}

	@SubscribeMessage("addToRoom")
	async addToRoom(client: AuthenticatedSocketChat, data: {userid: number, room_name: string}) : Promise<boolean> {
		const dest_room: IRoom = await this.rooms.findAccessibleRoom(client.data.id, data.room_name);
		if (dest_room.administrators.filter((admin) => admin.id === client.data.id).length === 0 || dest_room.accessibility === IRoomAccess.DirectMessage) {
			return false;
		}
		const updated_room: IRoom = await this.rooms.addUserToRoom(data.userid, data.room_name);
		if (updated_room === null || updated_room.administrators.filter((admin) => admin.id === client.data.id).length === 0) {
			return false;
		}
		const client2: AuthenticatedSocketChat = this.rooms.getSocketFromNamespace(data.userid);
		if (client2 !== null) {
			client2.join(updated_room.name);
		}
		this.rooms.server.to(updated_room.name).emit("roomUpdate", { room: updated_room });
		return true;
	}

	@SubscribeMessage("joinRoom")
	async joinRoom(client: AuthenticatedSocketChat, data: {room_name: string, password: string}) : Promise<boolean> {
		console.log("join triggered")
		if (await this.rooms.checkRoomStatus([data.room_name, data.password], client) === false) {
			return false;
		}
		const room: IRoom = await this.rooms.findAccessibleRoom(client.data.id, data.room_name);
		if (room === null) {
			return false;
		}
		this.rooms.server.to(room.name).emit("roomUpdate", { room: room });
		return true;
	}

	@SubscribeMessage("leaveRoom")
	async leaveRoom(client: AuthenticatedSocketChat, data: { room_name: string }) : Promise<boolean> {
		try {
			var class_user: number = await this.rooms.classifyUser(client.data.id, data.room_name);
		} catch (err: any) {
			return false;
		}
		await this.rooms.removeParticipant(client, data.room_name);
		if (class_user > 0) {
			await this.rooms.removeAdmin(client.data.id, data.room_name);
		}
		if (class_user > 1) {
			await this.rooms.removeOwner(client.data.id, data.room_name);
		}
		var room: IRoom = await this.rooms.findRecordRoom(data.room_name);
		this.rooms.server.to(room.name).emit("roomUpdate", { room: room });
		return true;
	}
}
