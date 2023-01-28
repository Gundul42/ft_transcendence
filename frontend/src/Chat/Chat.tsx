import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Header, ISafeAppState } from '../App';
import { io } from 'socket.io-client';
// import Box from '@mui/material/Box'

const socket = io("https://localhost/api/chat");

type ChatMessage = {
	name : String
	id : Number
	text : String
	socketID : Number
};

type ChatUser = {
	uname : String
	socketID : Number
}

const ChatBar = ({socket} : {socket: Socket}) => {
	const [users, setUsers] = useState<ChatUser[]>()

	useEffect(()=> {
			socket.on("newUserResponse", (data: any) => setUsers(data))
	}, [socket, users])

return (
	<div className='Chat-Contacts'>
		<h2>Rooms and friends</h2>
		<div>
			<div	className='Text-field'>ACTIVE USERS</div>
			<div className='chat_users'>
					{users?.map(user => <p key={user.socketID.toString()}>{user.uname}</p>)}
			</div>
		</div>
	</div>
);
}


const ChatBody = ({app_state, messages, lastMsg} : {app_state : ISafeAppState, messages : ChatMessage[], lastMsg : React.RefObject<HTMLDivElement>}) => { 
	
	return (
		<>
			<div className='Chat-Box'>
			{messages.map(message => (
				message.name === (app_state.data.data.display_name as string).split(' ')[0] ? (
				<div className="Message-Chats" key={message.id.toString()}>
				<p className='sender_name'>You</p>
				<div className='Message-Text'>
					<p>{message.text}</p>
				</div>
			</div>
				): (
				<div className="Message-Chats" key={message.id.toString()}>
				<p>{message.name}</p>
				<div className='message_recipient'>
					<p>{message.text}</p>
				</div>
			</div>
				)
				))}
	
			{/* <div className='message_status'>
				<p>{typingStatus}</p>
			</div> */}
			<div ref={lastMsg} />
			</div>
		</>
	);
	}

	const ChatFooter = ({app_state} : ISafeAppState) => {
		const [message, setMessage] = useState("")
		// const handleTyping = () => socket.emit("typing",`${localStorage.getItem("uname")} is typing`)

		const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
				e.preventDefault()
				if(message.trim() && (app_state.data.data.display_name as string).split(' ')[0]) {
		console.log(message);
		if (message[0] === '/')
		{
			const elements = message.substring(1, message.length).split(" ");
			console.log(elements);
			socket.emit(elements[0], 
				{
					text: elements.slice(1), 
					name: (app_state.data.data.display_name as string).split(' ')[0], 
					id: `${socket.id}${Math.random()}`,
					socketID: socket.id
				});
		}
		else
				{
			socket.emit("message", 
				{
				text: message, 
				name: (app_state.data.data.display_name as string).split(' ')[0], 
				id: `${socket.id}${Math.random()}`,
				socketID: socket.id
				});
		}
		console.log("msg sent");
				}
				setMessage("");
		}
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
// Input pretty, will implement
{/* <div class="search input-group">
                <input type="search" class="form-control rounded" placeholder="Search" aria-label="Search" aria-describedby="search-addon" />
                <span class="input-group-text border-0" id="search-addon">
                    <i class="bi bi-search"></i>
                </span>
            </div>` */}

//(app_state.data.data.full_name as string).split(' ')[0]
//Updating last message https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
export const Chat = ({app_state, set_page} : {app_state: ISafeAppState, set_page: any}) => {
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const lastMessageRef = useRef<HTMLDivElement>(null);
	
	useEffect(()=> {
		socket.on("messageResponse", (data: any) => setMessages([...messages, data]))
	}, [messages])
	
	useEffect(() => {
		lastMessageRef.current?.scrollIntoView({behavior: 'smooth'});
	}, [messages]);
	
	return (
	<div className="Chat">
		<ChatBar socket={socket}/>
		<div className='Chat-Body'>
			<Header set_page={set_page} />
			<ChatBody app_state={app_state} messages={messages} lastMsg={lastMessageRef}/>
			<ChatFooter app_state={app_state} />	
		</div>
	</div>
	)
	};