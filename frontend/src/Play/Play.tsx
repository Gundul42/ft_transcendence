import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { Canvas } from './Canvas';
import { InfoFooter } from './InfoFooter';
import { InfoHeader } from './InfoHeader';
import { Winner } from './Winner';
import { ServerEvents, ClientEvents } from '../events';
import { playFieldXMaxSize, playFieldYMaxSize, paddleHeight } from '../constants';
import { IFinish, IGameState, ILobbyState, ISafeAppState, IUserPublic } from '../Interfaces';

const emptyUser: IUserPublic = {
	id: 0,
	display_name: "",
	avatar: "",
	status: 0
}

const emptyLobby: ILobbyState = {
	player1: emptyUser,
	player2: emptyUser,
	id: 0,
	spectators: 0,
	p1_points: 0,
	p2_points: 0,
	round: 0
}

export const Play = ({app_state, set_page} : {app_state: ISafeAppState, set_page: any}) => {
	const [isKeyDown, setKeyDown] : [boolean, any] = useState(false);
	const [gameState, setGameState] : [IGameState, any] = useState({
		ball: {
			x: playFieldXMaxSize / 2,
			y: playFieldYMaxSize / 2
		},
		paddle1: { y: ((playFieldYMaxSize / 2) - (paddleHeight / 2))},
		paddle2: { y: ((playFieldYMaxSize / 2) - (paddleHeight / 2))}
	})
	const [lobbyState, setLobbyState] : [ILobbyState, any] = useState(emptyLobby);
	const [winner, SetWinner] : [IFinish | null, any] = useState(null);

	const keydown = (keyEvent: KeyboardEvent) => {
		if (!isKeyDown && [lobbyState.player1?.id, lobbyState.player2?.id].includes(app_state.data.id) === false) {
			if (keyEvent.key === "w" || keyEvent.key === "ArrowUp") {
				setKeyDown(true);
				socket.emit(ClientEvents.Up);
			} else if (keyEvent.key === "s" || keyEvent.key === "ArrowDown") {
				socket.emit(ClientEvents.Down);
				setKeyDown(true);
			}
		}
	}

	const keyup = (keyEvent: KeyboardEvent) => {
		if ([lobbyState.player1?.id, lobbyState.player2?.id].includes(app_state.data.id) === false) {
			if (keyEvent.key === "w" || keyEvent.key === "ArrowUp" || keyEvent.key === "s" || keyEvent.key === "ArrowDown") {
				socket.emit(ClientEvents.Stop);
				setKeyDown(false);
			}
		}
	}

	const leave = (e: BeforeUnloadEvent) => {
		socket.emit(ClientEvents.Leave);
	}

	useEffect(() => {
		window.addEventListener("keydown", keydown);
		window.addEventListener("keyup", keyup);
		window.addEventListener("beforeunload", leave);

		return () => {
			window.removeEventListener("keydown", keydown);
			window.removeEventListener("keyup", keyup);
			window.removeEventListener("beforeunload", leave);
		};
	}, [])

	useEffect(() => {
		socket.on(ServerEvents.GameState, (data: IGameState) => {
			setGameState(data);
		});
		socket.on(ServerEvents.LobbyState, (data: ILobbyState) => {
			setLobbyState(data);
		});
		socket.on(ServerEvents.Finish, (data: IFinish) => {
			SetWinner(data);
		})

		return () => {
			socket.off(ServerEvents.GameState);
			socket.off(ServerEvents.LobbyState);
			socket.off(ServerEvents.Finish);
		};
	}, []);

	return (
		<div className="Play">
			{winner !== null && lobbyState !== null &&
				<Winner data={winner} app_state={app_state} lobby_state={lobbyState} set_page={set_page} />}
			{lobbyState !== null &&
				<InfoHeader lobbyState={lobbyState} />}
			<Canvas gameState={gameState} />
			{lobbyState !== null &&
				<InfoFooter app_state={app_state} lobbyState={lobbyState} set_page={set_page} />}
			<button type="button" className="button" onClick={() => {set_page("home"); window.location.reload()}}>Exit</button>
		</div>
	)
}
