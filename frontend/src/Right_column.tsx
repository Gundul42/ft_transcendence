import React from 'react';
import { Status } from './App';
import './App.css';

export function RightColumn({result} : {result: any}) {
	if (result.status !== Status.Success) {
		return(
			<div className="Right-column"></div>
		)
	} else if (result.data.type === "content") {
		return (
			<div className="Right-column">
				<div className="Menu-icon"><img src="https://localhost/content/user_icon.png" alt="Profile"></img></div>
				<div className="break"></div>
				<div className="Menu-icon"><img src="https://localhost/content/chat_icon.png" alt="Chat"></img></div>
				<div className="break"></div>
				<div className="Menu-icon"><img src="https://localhost/content/exit_icon.png" alt="Exit"></img></div>
			</div>
		)
	} else {
		return(
			<div className="Right-column"></div>
		)
	}
}