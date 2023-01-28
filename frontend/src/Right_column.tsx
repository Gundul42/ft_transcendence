import React from 'react';
import { IAppState } from './App';
import endpoint from './endpoint.json'

function logOut(): void {
	fetch(endpoint.auth.logout, {
		method: "GET"
	})
	.then(
		() => { window.location.reload(); }
	);
}

export function RightColumn({app_state, set_page} : {app_state: IAppState, set_page: any}) {
	if (app_state.data !== null && app_state.data.type === "content") {
		return (
			<div className="Right-column">
				<div className="Menu-icon" onClick={() => {set_page("user")}}><img src={endpoint.content.img + "/icons/user.png"} alt="Profile"></img></div>
				<div className="break"></div>
				<div className="Menu-icon" onClick={() => {set_page("chat")}}><img src={endpoint.content.img + "/icons/chat.png"} alt="Chat"></img></div>
				<div className="break"></div>
				<div className="Menu-icon" onClick={logOut}><img src={endpoint.content.img + "/icons/exit.png"} alt="Exit"></img></div>
			</div>
		)
	} else {
		return(
			<div className="Right-column"></div>
		)
	}
}