import React, { useState, useEffect } from 'react';
import Ball from './Components/Ball'
import Paddle from './Components/Paddle';
import PongField from './Components/Pongfield';
import { Header, ISafeAppState } from '../App';
import { socket } from './socket';
import { playFieldXMaxSize, playFieldYMaxSize, paddleHeight } from '../constants';
import { ServerEvents, ClientEvents } from '../events';
import { IGameState, ILobbyState } from '../Interfaces';
import { UserPublic } from '../UserPublic';

export function Play({app_state, set_page} : {app_state: ISafeAppState, set_page: any}) {
	const [gameState, setGameState] : [IGameState, any] = useState({
		ball: {
			x: playFieldXMaxSize / 2,
			y: playFieldYMaxSize / 2
		},
		paddle1: { y: ((playFieldYMaxSize / 2) - (paddleHeight / 2))},
		paddle2: { y: ((playFieldYMaxSize / 2) - (paddleHeight / 2))}
	})

	const [lobbyState, setLobbyState] : [ILobbyState | null, any] = useState(null);

	const keydown = (keyEvent: KeyboardEvent) => {
		if (keyEvent.key === "w" || keyEvent.key === "ArrowUp") {
			socket.emit(ClientEvents.Up);
		} else if (keyEvent.key === "s" || keyEvent.key === "ArrowUp") {
			socket.emit(ClientEvents.Down);
		}
	}

	useEffect(() => {
		window.addEventListener("keydown", keydown);
		return () => window.removeEventListener("keydown", keydown);
	}, [])

	useEffect(() => {
		socket.on(ServerEvents.GameState, (data: IGameState) => {
			setGameState(data);
		});

		return () => {
			socket.off(ServerEvents.GameState);
		};
	}, []);

	useEffect(() => {
		socket.on(ServerEvents.LobbyState, (data: ILobbyState) => {
			setLobbyState(data);
		});

		return () => {
			socket.off(ServerEvents.GameState);
		};
	}, []);

	return (
		<div className="Play">
			{lobbyState !== null &&
				<InfoHeader lobbyState={lobbyState} />}
			<PongField />
			<Header set_page={set_page} />
			<Ball x={gameState.ball.x} y={gameState.ball.y} />
			<Paddle y={gameState.paddle2.y} isLeft={false} />
			<Paddle y={gameState.paddle1.y} isLeft={true} />
			{lobbyState !== null &&
				<InfoFooter lobbyState={lobbyState} />}
		</div>
	)
}

function InfoHeader({lobbyState} : {lobbyState: ILobbyState}) {
	return (
		<div className="Lobby-state">
			<p>{lobbyState.p1_points}</p>
			<p>Round: {lobbyState.round}</p>
			<p>{lobbyState.p2_points}</p>
		</div>
	)
}

function InfoFooter({lobbyState} : {lobbyState: ILobbyState}) {
	return (
		<div className="Lobby-state">
			<UserPublic user_info={lobbyState.player1} display_status={false} />
			<p>Spectators: {lobbyState.spectators}</p>
			<UserPublic user_info={lobbyState.player2} display_status={false} />
		</div>
	)
}