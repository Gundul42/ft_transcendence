import React from 'react';
import { ILobbyState } from '../Interfaces';

export const InfoHeader = ({lobbyState} : {lobbyState: ILobbyState}) => {
	return (
		<div className="Lobby-state">
			<p>{lobbyState.p1_points}</p>
			<p>Round: {lobbyState.round}</p>
			<p>{lobbyState.p2_points}</p>
		</div>
	)
}
