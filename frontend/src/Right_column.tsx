import React from 'react';
import { IAppState } from './Interfaces';
import endpoint from './endpoint.json'

const logOut = () => {
	fetch(endpoint.auth.logout, {
		method: "GET"
	})
	.then((res) => {
		if (!res.ok) {
			throw new Error("It was not possible to log out");
		}
		window.location.reload();
	})
	.catch((err: any) => {console.log(err)})
}

export const RightColumn = ({app_state, set_page, unreadMessages} : {app_state: IAppState, set_page: any, unreadMessages: number}) => {
	let chatClass: string;
	if (unreadMessages > 0) {
		chatClass = "Menu-icon-alert";
	} else {
		chatClass = "Menu-icon";
	}
	if (app_state.data !== null && app_state.data.type === "content") {
		return (
			<div className="Right-column">
				<div className="Menu-icon" onClick={() => {set_page("user")}}><img src={endpoint.content.img + "/icons/user.png"} alt="Profile"></img></div>
				<div className="break"></div>
				<div className={chatClass} onClick={() => {set_page("chat")}}><img src={endpoint.content.img + "/icons/chat.png"} alt="Chat"></img></div>
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