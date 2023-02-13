import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { DisplayAchievement } from './DisplayAchievement';
import { DisplayNamePrompt } from './DisplayNamePrompt';
import { Header } from '../Header';
import { LeftColumn } from './Left_column';
import { RightColumn } from '../Right_column';
import { IAppState, ISafeAppState } from '../Interfaces';
import { ClientEvents, ServerEvents } from '../events';

const PlayButton = ({setClicked, mode, game_socket} : {setClicked: any, mode: string, game_socket: Socket}) => {
	return (
		<button className="button" onClick={() => {setClicked(true); game_socket.emit(ClientEvents.Play, { mode: mode })}}>
			{mode[0].toUpperCase() + mode.slice(1)}
		</button>
	)
}

const Loading = ({setClicked, game_socket} : {setClicked: any, game_socket: Socket}) => {
	return (
		<div>
			<div className="lds-ring"><div></div><div></div><div></div><div></div></div>
			<div className="break"></div>
			<button className="button" onClick={() => {setClicked(false); game_socket.emit(ClientEvents.Cancel)}}>
				Cancel
			</button>
		</div>
	)
}

export function Home({app_state, set_page, unreadMessages, game_socket} : {app_state: ISafeAppState, set_page: any, unreadMessages: number, game_socket: Socket}) {
	const [isClicked, setClicked] : [boolean, any] = useState(false);

	useEffect(() => {
		game_socket.on(ServerEvents.Ready, () => {
			set_page("play");
		});

		return () => {
			game_socket.off(ServerEvents.Ready);
		};
	}, []);

	let converter: IAppState = {
		data: {
			type: "content",
			link: null,
			data: app_state.data
		},
		page: app_state.page
	}
	return(
		<div className="Home">
			{app_state.data.display_name === null &&
				<DisplayNamePrompt />}
			{ app_state.data.achievements.length > 0 && !app_state.data.achievements[0].aknowledged &&
				<DisplayAchievement achievement={app_state.data.achievements[0]} /> }
			<LeftColumn app_state={converter} set_page={set_page} game_socket={game_socket} />
			<Header set_page={set_page}/>
			<div className="Welcome-section">
				<h1>Welcome {app_state.data.display_name}</h1>
				<h2>Choose a mode and play</h2>
				<div style={{display: "flex", gap: "20px"}}>
					{!isClicked &&
						<PlayButton setClicked={setClicked} mode="classic" game_socket={game_socket} />}
					{!isClicked &&
						<PlayButton setClicked={setClicked} mode="special" game_socket={game_socket} />}
					{isClicked &&
						<Loading setClicked={setClicked} game_socket={game_socket} />}
				</div>
				<div className="break"></div>
				<p>In the special mode the ball is going to get faster every round</p>
			</div>
			<RightColumn app_state={converter} set_page={set_page} unreadMessages={unreadMessages} />
		</div>
	)
}
