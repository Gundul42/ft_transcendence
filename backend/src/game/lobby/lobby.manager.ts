import { Lobby } from './lobby';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../AuthenticatedSocket';
import { ServerEvents } from '../events';
import { PrismaService } from '../../prisma/prisma.service';
import { AppUser } from '@prisma/client';

export class LobbyManager {
	constructor(public prisma: PrismaService) {}

	public server: Server;
	private readonly lobbies: Map<Lobby['id'], Lobby> = new Map<Lobby['id'], Lobby>();

	public initializeSocket(client: AuthenticatedSocket, user: AppUser) : void {
		client.data.lobby = null;
		client.data.userid = user.id;
		client.data.info = {
			id: user.id,
			display_name: user.display_name,
			avatar: user.avatar,
			status: user.status
		}
	};

	public terminateSocket(client: AuthenticatedSocket) : void {
		client.data.lobby?.removeClient(client);
	}

	public upsertLobby(client: AuthenticatedSocket) : Lobby {
		let lobby_id: string = "";
		var upsertedLobby: Lobby | undefined;
		this.lobbies.forEach((value: Lobby, key: string, map: Map<string, Lobby>) => {
			if (!value.game_instance.started) {
				lobby_id = value.id;
			}
		});
		if (lobby_id.length === 0) {
			upsertedLobby = new Lobby(this.server, this);
			this.lobbies.set(upsertedLobby.id, upsertedLobby);
			client.data.role = "player1";
			upsertedLobby.addClient(client);
		} else {
			client.data.role = "player2";
			upsertedLobby = this.lobbies.get(lobby_id);
			if (upsertedLobby === undefined) {
				throw new Error("Found id of invalid lobby");
			}
			upsertedLobby.addClient(client);
			this.prisma.match.create({
				data: {
					id: lobby_id
				}
			})
			.catch((err: any) => {console.log(err)})
			this.updateUserStatus(upsertedLobby, 2);
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

	public async destroyLobby(lobby_id: string) : Promise<void> {
		if (this.lobbies.get(lobby_id) !== undefined && this.lobbies.get(lobby_id).game_instance.started) {
			let winnerid: number;
			let loserid: number;
			if (this.lobbies.get(lobby_id).game_instance.winner === 1) {
				winnerid = this.lobbies.get(lobby_id)?.player1.data.userid;
				loserid = this.lobbies.get(lobby_id)?.player2.data.userid;
			} else {
				loserid = this.lobbies.get(lobby_id)?.player1.data.userid;
				winnerid = this.lobbies.get(lobby_id)?.player2.data.userid;
			}
			this.prisma.match.update({
				where: {
					id: lobby_id
				},
				data: {
					winner: {
						connect: { id: winnerid }
					},
					loser: {
						connect: { id: loserid }
					},
					finished_at: new Date()
				}
			})
			.catch((err: any) => { console.log(err) });
			if (this.lobbies.get(lobby_id) !== undefined) {
				this.updateUserStatus(this.lobbies.get(lobby_id), 1);
				await this.updateStats(this.lobbies.get(lobby_id));
				this.updateLadder();
				this.lobbies.get(lobby_id).expelAll();
			}
		}
		this.lobbies.get(lobby_id)?.expelAll;
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

	private async updateStats(lobby: Lobby) : Promise<void> {
		let player1: AppUser = await this.prisma.appUser.findUnique({
			where: { id: lobby.player1.data.userid }
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
		let player2: AppUser = await this.prisma.appUser.findUnique({
			where: { id: lobby.player2.data.userid }
		})
		.catch((err: any) => {
			console.log(err);
			return null;
		});
		if (player1 === null || player2 === null) return;
		let winner: AppUser;
		let loser: AppUser;
		if (lobby.game_instance.winner === 1) {
			winner = player1;
			loser = player2;
		} else {
			winner = player2;
			loser = player1;
		}
		this.prisma.appUser.update({
			where: { id: winner.id },
			data: {
				wins: winner.wins + 1,
			}
		})
		.catch((err: any) => {console.log(err)});
		this.prisma.appUser.update({
			where: { id: loser.id },
			data: {
				losses: loser.losses + 1,
			}
		})
		.catch((err: any) => {console.log(err)});
	}

	private async updateLadder() : Promise<void> {
		const all_users: AppUser[] = await this.prisma.appUser.findMany({
			orderBy: [
				{ wins: "desc" },
				{ losses: "asc" }
			]
		})
		.catch((err: any) => {
			console.log(err);
			return ([]);
		});
		let ladder_level: number = 1;
		for (let i = 0; i < all_users.length; i++) {
			if (i === (ladder_level * (ladder_level + 1)) / 2) {
				ladder_level++;
			}
			if (all_users[i].ladder_level !== ladder_level) {
				await this.prisma.appUser.update({
					where: { id: all_users[i].id },
					data: {
						ladder_level: ladder_level
					}
				})
				.catch((err: any) => {console.log(err)});
			}
		}
	}

}