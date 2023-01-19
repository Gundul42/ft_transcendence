import React from 'react';
import { Status } from './App';
import './App.css';

function loadUser() {
	//load user page
}


function loadChat() {
	//load user page
}

function logOut(): void {
	fetch("https://localhost/api/logout", {
		method: "GET"
	})
	.then(
		() => { window.location.reload(); }
	);
}

export function RightColumn({result} : {result: any}) {
	if (result.status !== Status.Success) {
		return(
			<div className="Right-column"></div>
		)
	} else if (result.data.type === "content") {
		return (
			<div className="Right-column">
				<div className="Menu-icon" onClick={loadUser}><img src="https://localhost/content/img/icons/user.png" alt="Profile"></img></div>
				<div className="break"></div>
				<div className="Menu-icon" onClick={loadChat}><img src="https://localhost/content/img/icons/chat.png" alt="Chat"></img></div>
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