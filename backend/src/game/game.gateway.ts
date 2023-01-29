 import {
 	OnGatewayConnection,
 	OnGatewayDisconnect,
 	OnGatewayInit,
 	WsResponse,
 	SubscribeMessage,
 	WebSocketGateway,
   } from '@nestjs/websockets';
   import { Server, Socket } from 'socket.io';
//   import { ClientEvents } from '@shared/client/ClientEvents';
//   import { ServerEvents } from '@shared/server/ServerEvents';
//   import { LobbyManager } from '@app/game/lobby/lobby.manager';
//   import { Logger, UsePipes } from '@nestjs/common';

 @WebSocketGateway()
 export class GameGateway {

 	@SubscribeMessage("client.ping")
 	onPing(client: Socket): void {
 		client.emit("server.pong",  {message: "pong"})
 	}
 }