import React from 'react';
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

export const RightColumn = ({set_page, unreadMessages} : {set_page: any, unreadMessages: number}) => {
	let chatClass: string;
	if (unreadMessages > 0) {
		chatClass = "Menu-icon-alert";
	} else {
		chatClass = "Menu-icon";
	}
	return (
		<div className="Right-column">
			<div className="Menu-icon" onClick={() => {set_page("user")}}><img src={endpoint.content.img + "/icons/user.png"} alt="Profile"></img></div>
			<div className="break"></div>
			<div className={chatClass} onClick={() => {set_page("chat")}}><img src={endpoint.content.img + "/icons/chat.png"} alt="Chat"></img></div>
			<div className="break"></div>
			<div className="Menu-icon" onClick={logOut}><img src={endpoint.content.img + "/icons/exit.png"} alt="Exit"></img></div>
		</div>
	)
}