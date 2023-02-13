import React from 'react';
import { UserPublic } from '../UserPublic';
import { IFinish, ILobbyState, ISafeAppState, IUserPublic } from '../Interfaces';

export const Winner = ({ data, app_state, lobby_state, set_page } : { data: IFinish, app_state: ISafeAppState, lobby_state: ILobbyState, set_page: any }) => {
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