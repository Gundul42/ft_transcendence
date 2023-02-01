import { Socket } from 'socket.io';
import { Lobby } from './lobby/lobby';

export type AuthenticatedSocket = Socket & {
	data: {
		lobby: null | Lobby,
		userid: number,
		role: "player1" | "player2" | "spectator"
	}
}