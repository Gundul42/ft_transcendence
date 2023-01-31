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
		this.lobbyManager.initializeSocket(client as AuthenticatedSocket, session_user.user.id);
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
		const lobby: Lobby = this.lobbyManager.upsertLobby(client);
		if (lobby.game_instance.started) {
			this.lobbyManager.server.of("/game").emit(ServerEvents.GlobalState, {
				ongoing_matches: Array.from(this.lobbyManager.getLobbies(), (entry) => {
					return ({
						lobbyId: entry[0],
						player1: entry[1].player1,
						player2: entry[1].player2
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
}
