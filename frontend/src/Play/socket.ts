import { io } from 'socket.io-client';
import { ServerEvents, ClientEvents } from './events';

export const socket = io("https://localhost/game", {'transports': ['polling', 'websocket']});

export const startMatchMaking = () => {
	socket.emit(ClientEvents.Play);
	console.log("Matchmaking started");
}