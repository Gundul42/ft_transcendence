import React from 'react';
import { Status } from './App';
import './App.css';

function logOut(): void {
	fetch("https://localhost/api/logout", {
		method: "GET"
	})
	.then(
		() => { window.location.reload(); }
	);
}

export function RightColumn({result, set_page} : {result: any, set_page: any}) {
	if (result.status !== Status.Success) {
		return(
			<div className="Right-column"></div>
		)
	} else if (result.data.type === "content") {
		return (
			<div className="Right-column">
				<div className="Menu-icon" onClick={() => {set_page("user")}}><img src="https://localhost/content/img/icons/user.png" alt="Profile"></img></div>
				<div className="break"></div>
				<div className="Menu-icon" onClick={() => {set_page("chat")}}><img src="https://localhost/content/img/icons/chat.png" alt="Chat"></img></div>
				<div className="break"></div>
				<div className="Menu-icon" onClick={logOut}><img src="https://localhost/content/img/icons/exit.png" alt="Exit"></img></div>
			</div>
		)
	} else {
		return(
			<div className="Right-column"></div>
		)
	}
}