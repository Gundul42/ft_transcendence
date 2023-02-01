import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WsResponse,
	WebSocketServer,
	SubscribeMessage,
	WebSocketGateway,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { Session, AppUser } from '@prisma/client';
import { AuthenticatedSocket } from './AuthenticatedSocket';
import { ServerEvents, ClientEvents } from './events';
import { LobbyManager } from './lobby/lobby.manager';
import { Lobby } from './lobby/lobby';

@WebSocketGateway(3030, {namespace: 'game', transports: ['polling', 'websocket']})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	
	constructor(
		private readonly lobbyManager: LobbyManager,
		private readonly prisma: PrismaService) {}

	afterInit(server: Server) {
		this.lobbyManager.server = server;
		this.lobbyManager.prisma = this.prisma;
	}

	async handleConnection(client: Socket, ...args: any[]) : Promise<void> {
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
		if (session_user === null) {
			client.disconnect(true);
			return ;
		}
		this.lobbyManager.initializeSocket(client as AuthenticatedSocket, session_user.user);
		this.prisma.appUser.update({
			where: { id: session_user.user.id },
			data: {
				status: 1
			}
		})
	}

	async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
		if (client.data.role === "player1" && client.data.lobby !== null && !client.data.lobby.game_instance.started) {
			this.lobbyManager.destroyLobby(client.data.lobby.id);
		}
		this.lobbyManager.terminateSocket(client);
		this.prisma.appUser.update({
			where: { id: client.data.userid },
			data: {
				status: 0
			}
		})
	}

	@SubscribeMessage(ClientEvents.Play)
	joinPlayer(client: AuthenticatedSocket) : void {
		console.log("Upserting lobby");
		try {
			var lobby: Lobby = this.lobbyManager.upsertLobby(client);
		} catch (err: any) {
			console.log(err);
			return ;
		}
		if (lobby.game_instance.started) {
			this.lobbyManager.server.emit(ServerEvents.GlobalState, {
				ongoing_matches: Array.from(this.lobbyManager.getLobbies(), (entry) => {
					return ({
						lobbyId: entry[0],
						player1: entry[1].player1.data.info,
						player2: entry[1].player2.data.info
					});
				})
			})
		}
	}

	@SubscribeMessage(ClientEvents.Cancel)
	cancelLobbyCreation(client: AuthenticatedSocket) : void {
		console.log("purging lobby");
		if (client.data.role === "player1" && client.data.lobby !== null && !client.data.lobby.game_instance.started) {
			this.lobbyManager.destroyLobby(client.data.lobby.id);
		}
	}

	@SubscribeMessage(ClientEvents.Watch)
	joinSpectator(client: AuthenticatedSocket, data: {lobbyId: string}) : void {
		this.lobbyManager.joinAsSpectator(client, data.lobbyId);
	}

	/*
	The direction of the keys is inverse compared to the direction of html canvas,
	therefore the direction is inverted in the next two functions
	*/
	@SubscribeMessage(ClientEvents.Up)
	moveUp(client: AuthenticatedSocket) : void {
		let id: number;
		if (client.data.role === "player1") {
			id = 1;
		} else if (client.data.role === "player2") {
			id = 2;
		} else {
			return ;
		}
		client.data.lobby?.game_instance.state.movePaddle(id, -1);
	}

	@SubscribeMessage(ClientEvents.Down)
	moveDown(client: AuthenticatedSocket) : void {
		let id: number;
		if (client.data.role === "player1") {
			id = 1;
		} else if (client.data.role === "player2") {
			id = 2;
		} else {
			return ;
		}
		client.data.lobby?.game_instance.state.movePaddle(id, 1);
	}
}
