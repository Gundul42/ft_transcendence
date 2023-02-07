import { v4 as uuidv4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from '../AuthenticatedSocket';
import { GameInstance } from '../GameInstance';
import { ClientEvents, ServerEvents } from '../events';
import { LobbyManager } from './lobby.manager';

export class Lobby {
	public readonly id: string = uuidv4();
	public readonly max_clients: number = 10;
	public readonly created_at: Date = new Date();
	public player1: AuthenticatedSocket;
	public player2: AuthenticatedSocket;
	public readonly spectators: Map<Socket['id'], AuthenticatedSocket> = new Map<Socket['id'], AuthenticatedSocket>();
	public readonly game_instance: GameInstance = new GameInstance(this, 2/*we can add difficulty logic based on ladder level*/);

	constructor(
		private readonly server: Server,
		private readonly lobbyManager: LobbyManager,
		public readonly mode: "classic" | "special"
	) {}

	public addClient(client: AuthenticatedSocket) : void {
		client.join(this.id);
		client.data.lobby = this;
		if (client.data.role === "player1") {
			this.player1 = client;
			return ;
		} else if (client.data.role === "player2") {
			this.player2 = client;
			this.game_instance.started = true;
			this.dispatchToLobby(ServerEvents.Ready, {});
			this.game_instance.start();
		} else {
			this.spectators.set(client.id, client);
			this.sendLobbyState();
		}
	}

	public removeClient(client: AuthenticatedSocket) : void {
		client.data.lobby = null;
		client.leave(this.id);
		if (client.data.role == "player1") {
			this.finishGame({winner: 2, message: "Player 1 has left"});
		} else if (client.data.role == "player2") {
			this.finishGame({winner: 1, message: "Player 2 has left"});
		} else {
			this.spectators.delete(client.id);
			this.sendLobbyState();
		}
	}

	public finishGame({winner, message} : {winner: number, message: string}) : void {
		if (!this.game_instance.intervalId) return;
		clearInterval(this.game_instance.intervalId);
		this.game_instance.finished = true;
		this.game_instance.winner = winner;
		this.dispatchToLobby(ServerEvents.Finish, {
			winner: "player" + winner.toString(),
			message: message
		});
		this.lobbyManager.destroyLobby(this.id);
	}

	public sendLobbyState() : void {
		this.dispatchToLobby(ServerEvents.LobbyState, {
			player1: {...this.player1.data.info, id: this.player1.data.userid},
			player2: {...this.player2.data.info, id: this.player2.data.userid},
			lobbyId: this.id,
			spectators: this.spectators.size,
			p1_points: this.game_instance.player1_points,
			p2_points: this.game_instance.player2_points,
			round: this.game_instance.round
		});
	}

	public dispatchToLobby<T>(event: ServerEvents, payload: T) : void {
		this.server.to(this.id).emit(event, payload);
	}

	public expelAll() : void {
		this.server.socketsLeave(this.id);
		this.player1.data.lobby = null;
		this.player1.data.role = "noRole";
		this.player2.data.lobby = null;
		this.player2.data.role = "noRole";
		this.spectators.forEach((value: AuthenticatedSocket, key: string, map: Map<string, AuthenticatedSocket>) => {
			value.data.lobby = null;
			value.data.role = "noRole";
		})
	}
}