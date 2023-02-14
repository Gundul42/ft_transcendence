import { Lobby } from './lobby';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../AuthenticatedSocket';
import { ServerEvents } from '../events';
import { PrismaService } from '../../prisma/prisma.service';
import { AppUser } from '@prisma/client';
import { AchievementService } from '../../achievement/achievement.service';
import * as achievements from '../../achievements.json';

export class LobbyManager {
	constructor(
		public prisma: PrismaService,
		public achievementService: AchievementService) {}

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

	public createLobby(client1: AuthenticatedSocket, client2_id: number, mode: "classic" | "special") : Lobby {
		const clients: AuthenticatedSocket[] = Array.from((this.server.sockets as any), socket => socket[1]) as AuthenticatedSocket[];
		if (clients.filter(client => client.data.userid === client2_id && client.data.lobby === null).length === 0) {
			throw new Error("Other client is unavailable");
		}
		const client2: AuthenticatedSocket = clients.filter(client => client.data.userid === client2_id && client.data.lobby === null)[0];
		const new_lobby: Lobby = new Lobby(this.server, this, mode, true);
		this.lobbies.set(new_lobby.id, new_lobby);
		client1.data.role = "player1";
		new_lobby.addClient(client1);
		console.log("emitting game request");
		this.server.to(client2.id).emit(ServerEvents.ForwardInvitation, { player1: client1.data.info, lobbyId: new_lobby.id });
		return (new_lobby);
	}

	public handleRespond(client: AuthenticatedSocket, lobbyId: string, accept: boolean) : void {
		const target_lobby: Lobby | undefined = this.getLobbies().get(lobbyId);
		if (target_lobby === undefined || target_lobby.game_instance.started) {
			throw new Error("Lobby unavailable");
		} else if (!accept) {
			this.server.to(target_lobby.player1.id).emit(ServerEvents.ForwardDecline);
			this.destroyLobby(lobbyId);
		} else {
			client.data.role = "player2";
			target_lobby.addClient(client);
			this.prisma.match.create({
				data: {
					id: lobbyId
				}
			})
			.then(() => {this.updateUserStatus(target_lobby, 2)})
			.catch((err: any) => {console.log(err)});
		}
	}

	public abortInvite(clientId: number) : void {
		const clients: AuthenticatedSocket[] = Array.from((this.server.sockets as any), socket => socket[1]) as AuthenticatedSocket[];
		if (clients.filter(client => client.data.userid === clientId && client.data.lobby === null).length === 0) {
			throw new Error("Other client is unavailable");
		}
		const client2: AuthenticatedSocket = clients.filter(client => client.data.userid === clientId && client.data.lobby === null)[0];
		this.server.to(client2.id).emit(ServerEvents.AbortInvite);
	}

	public upsertLobby(client: AuthenticatedSocket, mode: "classic" | "special") : Lobby {
		let lobby_id: string = "";
		var upsertedLobby: Lobby | undefined;
		this.lobbies.forEach((value: Lobby, key: string, map: Map<string, Lobby>) => {
			if (!value.game_instance.started && value.mode === mode && !value.isInvite) {
				lobby_id = value.id;
			}
		});
		if (lobby_id.length === 0) {
			upsertedLobby = new Lobby(this.server, this, mode);
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
			.then(() => {this.updateUserStatus(upsertedLobby, 2)})
			.catch((err: any) => {console.log(err)})
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
				this.achievementService.grantAchievement(this.lobbies.get(lobby_id)?.player1.data.userid, achievements.noob);
				this.achievementService.grantAchievement(this.lobbies.get(lobby_id)?.player2.data.userid, achievements.noob);
				this.lobbies.get(lobby_id)?.spectators.forEach((value: AuthenticatedSocket, key: string, map: Map<string, AuthenticatedSocket>) => {
					this.achievementService.grantAchievement(value.data.userid, achievements.popcorn);
				})
				await this.updateUserStatus(this.lobbies.get(lobby_id), 1);
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

	private async updateUserStatus(lobby: Lobby, status: number) : Promise<void> {
		await this.prisma.appUser.update({
			where: { id: lobby.player1.data.userid },
			data: { status: status }
		})
		await this.prisma.appUser.update({
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
		await this.prisma.appUser.update({
			where: { id: winner.id },
			data: {
				wins: winner.wins + 1,
			}
		})
		.catch((err: any) => {console.log(err)});
		await this.prisma.appUser.update({
			where: { id: loser.id },
			data: {
				losses: loser.losses + 1,
			}
		})
		.catch((err: any) => {console.log(err)});
	}

	private async updateLadder() : Promise<void> {
		const all_users: AppUser[] = await this.prisma.appUser.findMany({
			where: {
				OR: [
					{
						wins: { gt: 0 }
					},
					{
						losses: { gt: 0 }
					}
				]
			},
			orderBy: [
				{ wins: "desc" },
				{ losses: "asc" }
			]
		})
		.catch((err: any) => {
			console.log(err);
			return ([]);
		});
		console.log(all_users)
		let ladder_level: number = 1;
		this.achievementService.grantAchievement(all_users[0].id, achievements.top);
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

	public async dispatchGlobalState() : Promise<void> {
		if (this.getLobbies().size === 0) return ;
		let data: any[] = Array.from(this.getLobbies(), (entry) => {
			if (entry[1].game_instance.started && entry[1].player1 !== undefined && entry[1].player2 !== undefined) {
				return ({
					id: entry[0],
					player1: entry[1]?.player1.data.info,
					player2: entry[1]?.player2.data.info
				});
			}
		});
		if (data.length === 0) return;
		await this.sleep(50);
		this.server.emit(ServerEvents.GlobalState, data);
	}

	sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
}