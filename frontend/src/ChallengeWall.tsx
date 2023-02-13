import React from 'react';
import { Socket } from 'socket.io-client';
import { ClientEvents } from './events';
import { IChallengeInvite } from './Interfaces';

export function ChallengeWall({invites, setInvites, set_page, game_socket} : {invites: IChallengeInvite[], setInvites: any, set_page: any, game_socket: Socket}) {
	const respondInvitation = (lobbyId: string, accept: boolean) => {
		game_socket.emit(ClientEvents.RespondInvitation, { lobbyId: lobbyId, accept: accept });
		setInvites([]);
		if (accept) {
			set_page("play");
		}
	};

	return (
		<div className="Wall">
			<h1>You have been challenged by {invites[0].player1.display_name}</h1>
			<div style={{display: "flex", gap: "1vw"}}>
				<button className="button" onClick={()=> {respondInvitation(invites[0].lobbyId, true)}}>Accept</button>
				<button className="button" onClick={()=> {respondInvitation(invites[0].lobbyId, false)}}>Decline</button>
			</div>
		</div>
	)
}