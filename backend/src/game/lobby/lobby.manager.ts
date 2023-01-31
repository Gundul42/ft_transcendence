import { Lobby } from './lobby';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../AuthenticatedSocket';
import { ServerEvents } from '../events';
import { PrismaService } from '../../prisma/prisma.service';

export class LobbyManager {
	public server: Server;
	private readonly lobbies: Map<Lobby['id'], Lobby> = new Map<Lobby['id'], Lobby>();

	constructor(private readonly prisma: PrismaService) {}

	public initializeSocket(client: AuthenticatedSocket, userid: number) : void {
		client.data.lobby = null;
		client.data.userid = userid;
	};

	public terminateSocket(client: AuthenticatedSocket) : void {
		client.data.lobby?.removeClient(client);
	}

	public upsertLobby(client: AuthenticatedSocket) : Lobby {
		let lobby_id: string = "";
		var upsertedLobby: Lobby;
		this.lobbies.forEach((value: Lobby, key: string, map: Map<string, Lobby>) => {
			if (!value.game_instance.started) {
				lobby_id = value.id;
			}
		});
		if (lobby_id.length === 0) {
			upsertedLobby = new Lobby(this.server, this);
			client.data.role = "player1";
			upsertedLobby.addClient(client);
		} else {
			client.data.role = "player2";
			upsertedLobby = this.lobbies[lobby_id];
			upsertedLobby.addClient(client);
			this.prisma.match.create({
				data: {
					id: lobby_id,
					player1: {
						connect: { id: upsertedLobby.player1.data.userid }
					},
					player2: {
						connect: { id: upsertedLobby.player2.data.userid }
					}
				}
			})
		}
		return upsertedLobby;
	}

	public joinAsSpectator(client: AuthenticatedSocket, lobby_id: string) : void {
		const lobby = this.lobbies.get(lobby_id);

		if (!lobby) {
			client.emit(ServerEvents.Refuse, {
				message: "Selected lobby is not available"
			});
		} else if (lobby.spectators.size === lobby.max_clients) {
			client.emit(ServerEvents.Refuse, {
				message: "Lobby is full"
			});
		} else {
			client.data.role = "spectator";
			lobby.addClient(client);
		}
	}

	public destroyLobby(lobby_id: string) : void {
		this.prisma.match.update({
			where: {
				id: lobby_id
			},
			data: {
				winner: this.lobbies[lobby_id].game_instance.winner
			}
		})
		.catch((err: any) => { console.log(err) });
		this.updateUserStatus(this.lobbies[lobby_id], 1);
		this.lobbies[lobby_id].server.socketsLeave(lobby_id);
		this.lobbies.delete(lobby_id);
	}

	public getLobbies() : Map<Lobby['id'], Lobby> {
		return this.lobbies;
	}

	private updateUserStatus(lobby: Lobby, status: number) : void {
		this.prisma.appUser.update({
			where: { id: lobby.player1.data.userid },
			data: { status: status }
		})
		this.prisma.appUser.update({
			where: { id: lobby.player2.data.userid },
			data: { status: status }
		})
	}
}