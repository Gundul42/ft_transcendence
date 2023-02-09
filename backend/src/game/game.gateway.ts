import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { Session, AppUser } from '@prisma/client';
import { AuthenticatedSocket } from './AuthenticatedSocket';
import { AchievementService } from '../achievement/achievement.service';
import { ServerEvents, ClientEvents } from './events';
import { LobbyManager } from './lobby/lobby.manager';
import { Lobby } from './lobby/lobby';

@WebSocketGateway(3030, {namespace: 'game', transports: ['polling', 'websocket']})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	
	constructor(
		private readonly lobbyManager: LobbyManager,
		private achievementService: AchievementService,
		private prisma: PrismaService) {}

	afterInit(server: Server) {
		this.lobbyManager.server = server;
		this.lobbyManager.prisma = this.prisma;
		this.lobbyManager.achievementService = this.achievementService;
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
		if (session_user === null || session_user.user === null) {
			client.disconnect(true);
			return ;
		}
		this.lobbyManager.initializeSocket(client as AuthenticatedSocket, session_user.user);
		await this.prisma.appUser.update({
			where: { id: session_user.user.id },
			data: {
				status: 1
			}
		})
		this.lobbyManager.dispatchGlobalState();
	}

	async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
		if (client.data.role === "player1" && client.data.lobby !== null && !client.data.lobby.game_instance.started) {
			this.lobbyManager.destroyLobby(client.data.lobby.id);
		}
		if (client.data.userid === undefined) return;
		this.lobbyManager.terminateSocket(client);
		await this.prisma.appUser.update({
			where: { id: client.data.userid },
			data: {
				status: 0
			}
		})
	}

	@SubscribeMessage(ClientEvents.Play)
	joinPlayer(client: AuthenticatedSocket, data: { mode: "classic" | "special" }) : void {
		console.log("Upserting lobby");
		try {
			var lobby: Lobby = this.lobbyManager.upsertLobby(client, data.mode);
		} catch (err: any) {
			console.log(err);
			return ;
		}
		if (lobby.game_instance.started) {
			this.lobbyManager.dispatchGlobalState();
		}
	}

	@SubscribeMessage(ClientEvents.Cancel)
	cancelLobbyCreation(client: AuthenticatedSocket, data: { player2_id: number }) : void {
		console.log("purging lobby");
		if (client.data.role === "player1" && client.data.lobby !== null && !client.data.lobby.game_instance.started) {
			if (client.data.lobby.isInvite && data !== undefined) {
				this.lobbyManager.abortInvite(data.player2_id);
			}
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
		client.data.lobby?.game_instance.state.setPaddleDirection(id, -1);
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
		client.data.lobby?.game_instance.state.setPaddleDirection(id, 1);
	}

	@SubscribeMessage(ClientEvents.Stop)
	stopPaddle(client: AuthenticatedSocket) : void {
		let id: number;
		if (client.data.role === "player1") {
			id = 1;
		} else if (client.data.role === "player2") {
			id = 2;
		} else {
			return ;
		}
		client.data.lobby?.game_instance.state.setPaddleDirection(id, 0);
	}

	@SubscribeMessage(ClientEvents.Leave)
	handleLeave(client: AuthenticatedSocket) : void {
		console.log("client is leaving match");
		if (client.data.role === "player1" && client.data.lobby !== null && !client.data.lobby.game_instance.started) {
			this.lobbyManager.destroyLobby(client.data.lobby.id);
		}
		this.lobbyManager.terminateSocket(client);
	}

	@SubscribeMessage(ClientEvents.Invite)
	invitePlayer(client: AuthenticatedSocket, data: { player2_id: number, mode: "classic" | "special" }) : void {
		console.log("Invitation has been sent");
		try {
			this.lobbyManager.createLobby(client, data.player2_id, data.mode);
		} catch (err: any) {
			console.log(err);
		}
	}

	@SubscribeMessage(ClientEvents.RespondInvitation)
	respondInvitation(client: AuthenticatedSocket, data: { lobbyId: string, accept: boolean }) : void {
		try {
			this.lobbyManager.handleRespond(client, data.lobbyId, data.accept);
		} catch (err: any) {
			console.log(err);
		}
	}
}
