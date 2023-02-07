import React, { useState, useEffect } from 'react';
import { ISafeAppState } from '../App';
import { socket } from './socket';
import { playFieldXMaxSize, playFieldYMaxSize, paddleHeight } from '../constants';
import { ServerEvents, ClientEvents } from '../events';
import { IFinish, IGameState, ILobbyState, IUserPublic } from '../Interfaces';
import { UserPublic } from '../UserPublic';
import { Canvas } from './Canvas';

export function Play({app_state, set_page} : {app_state: ISafeAppState, set_page: any}) {
	const [isKeyDown, setKeyDown] : [boolean, any] = useState(false);
	const [gameState, setGameState] : [IGameState, any] = useState({
		ball: {
			x: playFieldXMaxSize / 2,
			y: playFieldYMaxSize / 2
		},
		paddle1: { y: ((playFieldYMaxSize / 2) - (paddleHeight / 2))},
		paddle2: { y: ((playFieldYMaxSize / 2) - (paddleHeight / 2))}
	})

	const [lobbyState, setLobbyState] : [ILobbyState | null, any] = useState(null);
	const [winner, SetWinner] : [IFinish | null, any] = useState(null);

	const keydown = (keyEvent: KeyboardEvent) => {
		if (!isKeyDown) {
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
		if (keyEvent.key === "w" || keyEvent.key === "ArrowUp" || keyEvent.key === "s" || keyEvent.key === "ArrowDown") {
			socket.emit(ClientEvents.Stop);
			setKeyDown(false);
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
		</div>
	)
}

function Winner({ data, app_state, lobby_state, set_page } : { data: IFinish, app_state: ISafeAppState, lobby_state: ILobbyState, set_page: any }) {
	let winner: IUserPublic = data.winner === "player1" ? lobby_state.player1 : lobby_state.player2;
	return(
		<div className="Wall">
			<h1>{data.message}</h1>
			<div style={{display: "flex", flexDirection: "row"}}>
				<p>The Winner is:&nbsp;</p>
			<UserPublic user_info={winner} app_state={app_state} display_img={true} display_status={false} set_page={set_page} />
			</div>
			<button type="button" className="button" onClick={() => {set_page("home"); window.location.reload()}}>Go Back</button>
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

function InfoFooter({lobbyState, app_state, set_page} : {lobbyState: ILobbyState, app_state: ISafeAppState, set_page: any}) {
	return (
		<div className="Lobby-state">
			<UserPublic user_info={lobbyState.player1} app_state={app_state} display_img={true} display_status={false} set_page={set_page} />
			<p>Spectators: {lobbyState.spectators}</p>
			<UserPublic user_info={lobbyState.player2} app_state={app_state} display_img={true} display_status={false} set_page={set_page} />
		</div>
	)
}