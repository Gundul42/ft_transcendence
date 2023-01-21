import React from 'react';
import { io } from 'socket.io-client';
import { Header } from './App';

const socket = io("https://localhost/chat");
// new Server = 
// function handleSubmit(value: React.FormEvent<HTMLFormElement>)
// {
// 	console.log("In handle submit");
// 	console.log(value);
// }

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
	const message = form.msg.value;
    // const ageInput = event.target.elements.age; // accessing via `form.elements`
	console.log("here");
    console.log(message); // output: 'foo@bar.com'
	if (message)
		socket.emit<"message">(message);
	socket.emit("message", message);
	socket.emit<"join">(message);
	alert("!!!");
    // console.log(ageInput.value); // output: '18'
};

function sendPing()
{
	console.log("pinging");
	socket.emit("ping");
}

export function Chat({app_state, set_page} : {app_state: any, set_page: any}) {
	return (
		<div className="Chat">
			<Header set_page={set_page} />
			<form onSubmit={handleSubmit}>
				<label>
					Message:
				<input type="text" name="msg" id="msg" placeholder="Start your chat here"/>
				</label>
				<input type="submit" value="Submit" />
			</form>
			<button onClick={ sendPing }>Send ping</button>
		</div>
	)
}