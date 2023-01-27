import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Header } from '../App';
import { io } from 'socket.io-client';
// import Box from '@mui/material/Box'

const socket = io("https://localhost/chat");

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

// const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
//		 event.preventDefault();

//		 const form = event.target as HTMLFormElement;
// 	const message = form.msg.value as String;
//		 // const ageInput = event.target.elements.age; // accessing via `form.elements`
// 	// console.log("here");
//		 // console.log(message); // output: 'foo@bar.com'
// 	if (!message)
// 		return ;
// 	if (message[0] === '/')
// 	{
// 		const elements = message.substring(1, message.length).split(" ");
// 		console.log(elements);
// 		socket.emit(elements[0], {message: elements.slice(1)});
// 	}
// 	else
// 	{
// 		console.log("Message: ", message);
// 		socket.emit("message", message);
// 	}
// 	// socket.emit("message", message);
// 	// socket.emit<"join">(message);
// 	// alert("!!!");
//		 // console.log(ageInput.value); // output: '18'
// };

// function sendPing()
// {
// 	console.log("pinging");
// 	socket.emit("ping", "test");
// }

// export function Chat({app_state, set_page} : {app_state: any, set_page: any}) {
// 	return (
// 		<div className="Chat">
// 			{/* <Header set_page={set_page} /> */}
// 			<ChatBody></ChatBody>
// 			<form onSubmit={handleSubmit}>
// 				<label>
// 					Message:
// 				<input type="text" name="msg" id="msg" placeholder="Start your chat here"/>
// 				</label>
// 				<input type="submit" value="Submit" />
// 			</form>
// 			<button onClick={ sendPing }>Send ping</button>
// 		</div>
// 	)
// }

const ChatBar = ({socket} : {socket: Socket}) => {
	const [users, setUsers] = useState<ChatUser[]>()

	useEffect(()=> {
			socket.on("newUserResponse", (data: any) => setUsers(data))
	}, [socket, users])

return (
	<div className='Left-column'>
			<h2>Open Chat</h2>
			<div>
					<h4	className='chat_header'>ACTIVE USERS</h4>
					<div className='chat_users'>
							{users?.map(user => <p key={user.socketID.toString()}>{user.uname}</p>)}
					</div>
			</div>
	</div>
);
}

const ChatBody = ({app_state, messages, lastMsg} : {app_state : any, messages : ChatMessage[], lastMsg : React.RefObject<HTMLDivElement>}) => { 
	
	return (
		<>
		<header className='chat_mainHeader'>
			<p>Welcome to the Chatroom</p>
			</header>
	
			<div className='message_container'>
			{messages.map(message => (
				message.name === (app_state.data.data.display_name as string).split(' ')[0] ? (
				<div className="message_chats" key={message.id.toString()}>
				<p className='sender_name'>You</p>
				<div className='message_sender'>
					<p>{message.text}</p>
				</div>
			</div>
				): (
				<div className="message_chats" key={message.id.toString()}>
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

	const ChatFooter = ({app_state} : any) => {
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
		<div className='chat_footer'>
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

//(app_state.data.data.full_name as string).split(' ')[0]
//Updating last message https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
export const Chat = ({app_state, set_page} : {app_state: any, set_page: any}) => {
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
		<Header set_page={set_page} />
		<ChatBar socket={socket}/>
		<div className='chat_main'>
			<ChatBody app_state={app_state} messages={messages} lastMsg={lastMessageRef}/>
			<ChatFooter app_state={app_state} />	
		</div>
		</div>
	)
	};