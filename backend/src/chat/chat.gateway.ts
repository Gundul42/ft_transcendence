import { WebSocketGateway, 
	WebSocketServer, 
	MessageBody, 
	SubscribeMessage, 
	OnGatewayInit, 
	OnGatewayConnection, 
	OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { Server, Socket } from '/usr/local/lib/node_modules/socket.io';  //debugging, my IDE doesn't like the above line
// import {Server, Socket} from "@nestjs/platform-socket.io";

@WebSocketGateway( { namespace: 'chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;

	afterInit(server: Server)
	{
		server.use(async (socket: Socket, next) => {
		  const query = socket.handshake.query;
	
		  if (this.isValid(query)) {
			next();
			return;
		  }
	
		  return next(new Error("401"));
		});
	}

	handleConnection(client: Socket)
	{
		console.log("hm?");
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

	@SubscribeMessage("join")
	async handleJoinEvent(client: Socket, room: string, callback)
	{
		// Validate if client can join room here
		console.log("joining room", room);
		client.join(room);
		// callback(`joined: ${room}`);
		this.server.emit("messageResponse", "Welcome to ", room);
	}

	async handleLeaveEvent(client: Socket, room: string, callback)
	{
		console.log("left the room");
		client.leave(room);
		callback(`left: ${room}`);
	}

	isValid(query: any): boolean {
		// Perform validation logic here
		return true;
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

