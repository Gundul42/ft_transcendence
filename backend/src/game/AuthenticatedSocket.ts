import { Socket } from 'socket.io';
import { IUserPublic } from '../Interfaces';
import { Lobby } from './lobby/lobby';

export type AuthenticatedSocket = Socket & {
	data: {
		lobby: null | Lobby,
		userid: number,
		role: "noRole" | "player1" | "player2" | "spectator",
		info: IUserPublic
	}
}