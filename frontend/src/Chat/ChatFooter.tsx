import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { IRoom, IUser } from '../Interfaces';

export const ChatFooter = ({data_state, room, chat_socket} : {data_state : IUser, room: IRoom, chat_socket: Socket}) => {
	const [message, setMessage] : [string, any] = useState("");

	const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (message.trim() && (data_state.display_name as string).split(' ')[0]) {
			console.log(message);
			if (message[0] === '/') {
				const elements = message.substring(1, message.length).split(" ");
				console.log(elements);
				chat_socket.emit(elements[0], { text: elements.slice(1) }, (reply : string) => {
					console.log("callback ", reply);
					alert(reply);
				});
				window.location.reload();
			}
			else if (room !== undefined) {
				chat_socket.emit("message", { text: message, room: room.name }, (reply : string) => {
					console.log("callback ", reply);
					alert(reply);
				});
				window.localStorage.setItem(room.name, (Number(window.localStorage.getItem(room.name)) + 1).toString())
			}
		}
		setMessage("");
	};

	return (
		<div className='Chat-Input'>
			<form className='form' onSubmit={handleSendMessage}>
				<input 
					type="text" 
					placeholder='Write message' 
					className='message' 
					value={message} 
					onChange={e => setMessage(e.target.value)}
					/>
					<button className="sendBtn">SEND</button>
			</form>
		 </div>
	)
}
