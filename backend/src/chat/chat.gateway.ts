import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
  } from '@nestjs/websockets';
// import { Server } from 'socket.io';
  
@WebSocketGateway({namespace: 'api/chat'})
export class ChatGateway {
	@WebSocketServer()
	server;

	@SubscribeMessage("message")
	handleMsg(@MessageBody() message : string) : void
	{
		this.server.emit("message", message);
	}
// @WebSocketServer()

}