import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Header, ISafeAppState } from '../App';
import { io } from 'socket.io-client';
import { IUser } from '../Interfaces';
// import Box from '@mui/material/Box'

// const socket = io("https://localhost/api/chat");

type ChatMessage = {
	text:			String,
	uname:			String,
	id:				Number,
	socketID:		Number,
	room:			String
};

// type ChatUser = {
// 	uname : String
// 	socketID : Number
// }


//TODO: Instead, fetch from server, both friends and rooms that the user's in
const ChatBar = ({socket, app_state} : {socket: Socket, app_state: ISafeAppState}) => {
	// const [users, setUsers] = useState<Array<ChatUser>>(Array<ChatUser>());

	// socket.on("connection", (data) => {
	// 	console.log("connected socket, should be getting socket data")
	// 	setUsers([...users, data]);
	// });
	// const room_map: Map<number, ChatUser> = new Map(app_state.data.friends.map((friend) => [friend.id, friend]));

	// useEffect(()=> {
	// 		socket.on("newRecipientResponse", (data: any) => setUsers(data))
	// }, [socket, users])
	// if (users instanceof Array<ChatUser>)
	// {
	// 	console.log("as intended")
	// }
	// else
	// 	console.log("not intended");
return (
	<div className='Chat-Contacts'>
		<h2>Rooms and friends</h2>
		<div>
			<div	className='Text-field'>Users and Rooms</div>
			<div className='chat_users'>
					{/* {users.map(user => <p key={user.socketID.toString()}>{user.uname}</p>)} */}
			</div>
		</div>
	</div>
);
}

const handleCallback = (reply : string) =>
{
	console.log(reply);
	alert(reply);
}

const ChatBody = ({app_state, messages, lastMsg} : {app_state : ISafeAppState, messages : ChatMessage[], lastMsg : React.RefObject<HTMLDivElement>}) => { 
	
	console.log("Current msg state: ", messages)
	return (
		<>
			<div className='Chat-Box'>
			{
				messages.length > 0 &&
				messages.map(message => (
					<div className="Message-Chats" key={message.id.toString()}>
						<p>{message.uname}</p>
					<div className='Message-Text'>
						<p>{message.text}</p>
					</div>
				</div>))
			}
			<div ref={lastMsg} />
			</div>
		</>
	);
	}

	const ChatFooter = ({socket, data_state} : {socket: Socket, data_state : IUser}) => {
		const [message, setMessage] = useState<string>("");

		const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => 
		{
			e.preventDefault()
			if (message.trim() && (data_state.display_name as string).split(' ')[0]) 
			{
			console.log(message);
			if (message[0] === '/')
			{
				const elements = message.substring(1, message.length).split(" ");
				console.log(elements);
				socket.emit(elements[0], 
					{
						text: elements.slice(1), 
						name: (data_state.display_name as string).split(' ')[0], 
						id: `${socket.id}${Math.random()}`,
						socketID: socket.id,
					}, handleCallback);
			}
			else
			{
				socket.emit("message", 
					{
					text: message, 
					name: (data_state.display_name as string).split(' ')[0], 
					id: `${socket.id}${Math.random()}`,
					socketID: socket.id,
					room: "all"
					}, handleCallback);
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

const pingFunc = (socket: Socket) =>
{
	socket.emit("ping");
}

const joinAll = (socket: Socket) =>
{
	socket.emit("join", "all");
}

//(app_state.data.data.full_name as string).split(' ')[0]

//Updating last message https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
export const Chat = ({app_state, set_page} : {app_state: ISafeAppState, set_page: any}) => {
	const socket = io("https://localhost/chat");
	const [messages, setMessages] : [ChatMessage[], any] = useState([])
	const lastMessageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		console.log("one message of this kind only")
        socket.emit("connection");
		socket.on("connection", (data: ChatMessage[]) => {
			console.log("connected socket, should be getting msg data")
			console.log(data);
			setMessages(data);
		});
		socket.on("messageResponse", (data: ChatMessage[]) =>
		{
			console.log(data, " in msgRes");
			setMessages({
				messages: messages.concat(messages, data)
			})
		})
		socket.onAny((event, ...args) =>
		{
			console.log(event, args)
		})

		return () => {
			socket.off('connection');
			socket.off('disconnect');
			socket.off('messageResponse');
		  };
    }, []);

	useEffect(() => {
		lastMessageRef.current?.scrollIntoView({behavior: 'smooth'});
	}, [messages]);
	
	return (
	<div className="Chat">
		<ChatBar socket={socket} app_state={app_state}/>
		<div className='Chat-Body'>
			<Header set_page={set_page} />
			<ChatBody app_state={app_state} messages={messages} lastMsg={lastMessageRef}/>
			<ChatFooter socket={socket} data_state={app_state.data} />
			<button onClick={() => pingFunc(socket)}>Ping</button>
			<button onClick={() => joinAll(socket)}>Join Room</button>
		</div>
	</div>
	)
	};