import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { RoomsManager } from './rooms.manager';

export class Rooms {
	// public readonly id: string = uuidv4();
	// public readonly max_clients: number = 10;
	// public readonly created_at: Date = new Date();
	// public player1: AuthenticatedSocket;
	// public player2: AuthenticatedSocket;
	// public readonly spectators: Map<Socket['id'], AuthenticatedSocket> = new Map<Socket['id'], AuthenticatedSocket>();
	// public readonly game_instance: GameInstance = new GameInstance(this, 2/*we can add difficulty logic based on ladder level*/);

	// constructor(
	// 	private readonly server: Server,
	// 	private readonly lobbyManager: LobbyManager
	// 	//public readonly ladder_level: number
	// ) {}

	// public addClient(client: AuthenticatedSocket) : void {
	// 	client.join(this.id);
	// 	client.data.lobby = this;
	// 	if (client.data.role === "player1") {
	// 		this.player1 = client;
	// 	} else if (client.data.role === "player2") {
	// 		this.player2 = client;
	// 		this.game_instance.started = true;
	// 		this.game_instance.start();
	// 	} else {
	// 		this.spectators.set(client.id, client);
	// 	}
	// 	this.dispatchToLobby(ServerEvents.LobbyState, {
	// 		lobbyId: this.id,
	// 		spectators: this.spectators.size,
	// 		p1_points: this.game_instance.player1_points,
	// 		p2_points: this.game_instance.player2_points,
	// 		round: this.game_instance.round
	// 	})
	// }

	// public removeClient(client: AuthenticatedSocket) : void {
	// 	client.data.lobby = null;
	// 	client.leave(this.id);
	// 	if (client.data.role == "player1") {
	// 		this.game_instance.winner = 2;
	// 		this.dispatchToLobby(ServerEvents.Finish, {
	// 			winner: "player2",
	// 			message: "Player 1 has left"
	// 		});
	// 		this.game_instance.finished = true;
	// 	} else if (client.data.role == "player2") {
	// 		this.game_instance.winner = 1;
	// 		this.dispatchToLobby(ServerEvents.Finish, {
	// 			winner: "player1",
	// 			message: "Player 2 has left"
	// 		});
	// 		this.game_instance.finished = true;
	// 	} else {
	// 		this.spectators.delete(client.id);
	// 		this.dispatchToLobby(ServerEvents.LobbyState, {
	// 			lobbyId: this.id,
	// 			spectators: this.spectators.size,
	// 			p1_points: this.game_instance.player1_points,
	// 			p2_points: this.game_instance.player2_points,
	// 			round: this.game_instance.round
	// 		})
	// 	}
	// }

	// public dispatchToLobby<T>(event: ServerEvents, payload: T) : void {
	// 	this.server.to(this.id).emit(event, payload);
	// }
}