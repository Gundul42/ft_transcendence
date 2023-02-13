import React from 'react';
import { ILobbyState, ISafeAppState } from '../Interfaces';
import { UserPublic } from '../UserPublic';

export const InfoFooter = ({lobbyState, app_state, set_page} : {lobbyState: ILobbyState, app_state: ISafeAppState, set_page: any}) => {
	return (
		<div className="Lobby-state">
			<UserPublic user_info={lobbyState.player1} app_state={app_state} display_img={true} display_status={false} set_page={set_page} />
			<p>Spectators: {lobbyState.spectators}</p>
			<UserPublic user_info={lobbyState.player2} app_state={app_state} display_img={true} display_status={false} set_page={set_page} />
		</div>
	)
}