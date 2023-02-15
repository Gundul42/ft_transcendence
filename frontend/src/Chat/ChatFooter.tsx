import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { IRoom, IUser } from '../Interfaces';

export const ChatFooter = ({data_state, room, chat_socket} : {data_state : IUser, room: IRoom, chat_socket: Socket}) => {
	const [message, setMessage] : [string, any] = useState("");

	const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (message.trim() && (data_state.display_name as string).split(' ')[0]) {
			if (room !== undefined) {
				chat_socket.emit("message", { text: message, room: room.name }, (reply : string | null) => {
					if (reply === null) return;
					console.log("callback ", reply);
					alert(reply);
				});
				window.localStorage.setItem(room.name, (Number(window.localStorage.getItem(room.name)) + 1).toString())
			}
			else
				alert("Join a conversation first")
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
