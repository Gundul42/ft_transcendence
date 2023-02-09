import React, {useState, useEffect} from 'react';
import { ClientEvents, ServerEvents } from './events';
import { IChallengeInvite } from './Interfaces';
import { socket } from './Play/socket';

export function ChallengeWall({invites, setInvites, set_page} : {invites: IChallengeInvite[], setInvites: any, set_page: any}) {
	const respondInvitation = (lobbyId: string, accept: boolean) => {
		socket.emit(ClientEvents.RespondInvitation, { lobbyId: lobbyId, accept: accept });
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