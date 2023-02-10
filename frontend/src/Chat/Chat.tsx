import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Header, ISafeAppState } from '../App';
import { io } from 'socket.io-client';
import { IRoom, IUser, IUserPublic, IMessage } from '../Interfaces';
import { ClientEvents, ServerEvents } from '../events';
import endpoint from '../endpoint.json';
import { socket as game_socket } from '../Play/socket';
import { SearchBar } from './SearchBar';

const socket = io("https://localhost/chat", {'transports': ['polling', 'websocket']});

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

function Participants({app_state, room, set_page, setIsInfoView} : {app_state: ISafeAppState, room: IRoom, set_page: any, setIsInfoView: any}) {
	const [idChallenged, setIdChallenged] : [number, any] = useState(0);
	const [admin, setAdmin] : [boolean, any] = useState(false);

	const challenge = (player2_id: number, mode: "classic" | "special") => {
		console.log("invitation is being sent")
		game_socket.emit(ClientEvents.Invite, { player2_id: player2_id, mode: mode})
		setIdChallenged(player2_id);
	};

	useEffect(() => {
		game_socket.on(ServerEvents.Ready, () => {
			set_page("play");
		});
		game_socket.on(ServerEvents.ForwardDecline, () => {
			setIdChallenged(0);
		})

		return () => {
			game_socket.off(ServerEvents.Ready);
			game_socket.off(ServerEvents.ForwardDecline);
		}
	})

	useEffect(() => {
		console.log("checking if admin")
		room.administrators.map((admin) =>
		{
			if (admin.id === app_state.data.id)
				setAdmin(true);
		})
	}, [room.administrators, app_state.data.id])

	const promoteAdmin = (user_id: number) => {
		let form_data: string[] = [];
		form_data.push(encodeURIComponent("room") + "=" + encodeURIComponent(room.name));
		form_data.push(encodeURIComponent("user") + "=" + encodeURIComponent(user_id));
		fetch(endpoint.chat['admin-promotion'], {
			method: "POST",
			body: form_data.join('&'),
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
	};

	const kickUser = (user_id: number) => {
		const reason = prompt("Reason for kicking this user?")
		if (!reason)
			return (alert("Please don't use it for no reason"))
		let form_data: string[] = [];
		form_data.push(encodeURIComponent("room") + "=" + encodeURIComponent(room.name));
		form_data.push(encodeURIComponent("user") + "=" + encodeURIComponent(user_id));
		form_data.push(encodeURIComponent("reason") + "=" + encodeURIComponent(reason));
		fetch(endpoint.chat['user-kick'], {
			method: "POST",
			body: form_data.join('&'),
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
	};

	if (idChallenged !== 0) {
		return (
			<div>
				<div className="lds-ring"><div></div><div></div><div></div><div></div></div>
				<div className="break"></div>
				<button className="button" onClick={() => {setIdChallenged(0); game_socket.emit(ClientEvents.Cancel, {player2_id: idChallenged})}}>
					Cancel
				</button>
			</div>
		)
	}
	return (
		<div>
			<table>
				<tbody>
				{room.participants.map((participant, id) => {
					return (
						<tr key={id}>
							<td>{participant.display_name}</td>
							{ participant.id !== app_state.data.id &&
								<td>
									<button onClick={()=>{set_page("visit", participant.id)}}>&#x1f464;</button>
									<button onClick={()=>{challenge(participant.id, "classic")}}>Challenge | Classic</button>
									<button onClick={()=>{challenge(participant.id, "special")}}>Challenge | Special</button>
									{ admin === true &&
										<>
										<button onClick={()=>{kickUser(participant.id)}}>Kick from room</button>
										<button>fancyAdminButton</button>
										</>
									}
									{ room.administrators[0].id === app_state.data.id && room.administrators.includes(participant) === false && 
									<button onClick={()=>{promoteAdmin(participant.id)}}>Promote to admin</button>
									}

								</td>}
						</tr>
					)
				})}
				</tbody>
			</table>
			<button onClick={()=> {setIsInfoView(false)}}>Close</button>
		</div>
	)
}

//TODO: Instead, fetch from server, both friends and rooms that the user's in
const ChatBar = ({socket, app_state, rooms, set_room, setIsInfoView, set_page} : {socket: Socket, app_state: ISafeAppState, rooms: IRoom[], set_room: any, setIsInfoView: any, set_page: any}) => {
	const room_access: string[] = ["Public", "Private", "PW required"];
	return (
		<div className='Chat-Contacts'>
			<h2>Rooms and friends</h2>
			<SearchBar set_page={set_page}/>
			<div>
				<div className='Text-field'>Users and Rooms</div>
				<table>
					<tbody>
						{/* {users.map(user => <p key={user.socketID.toString()}>{user.uname}</p>)} */}
						{ rooms.length > 0 && 
							rooms.map((room, i) => {
								return (
									<tr key={i} onClick={()=>{set_room(i); console.log("loading room n ", i)}}>
										<td>{room.name}</td>
										<td>{room_access[room.accessibility]}</td>
										<td><button onClick={()=> {setIsInfoView(true)}}>&#x2139;</button></td>
									</tr>
								)
							})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

const handleCallback = (reply : string) =>
{
	console.log(reply);
	alert(reply);
}

const ChatBody = ({app_state, room/*, lastMsg*/} : {app_state : ISafeAppState, room: IRoom/*, lastMsg : React.RefObject<HTMLDivElement>*/}) => { 
	const participants_map = new Map(room.participants.map((value) => [value.id, value]));
	const [messages, setMessages] : [IMessage[], any] = useState([...room.messages]);
	const lastMessageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		socket.on("messageResponse", (data: ChatMessage[]) =>
		{
			setMessages((prev_messages: ChatMessage[]) => ([
				...prev_messages,
				data
			]));
		});

		return () => {
			socket.off('messageResponse');
		}
	})

	useEffect(() => {
		setMessages([...room.messages]);
	}, [room])
	
	useEffect(() => {
		lastMessageRef.current?.scrollIntoView({behavior: 'smooth'});
	}, [messages]);

	console.log("Current msg state: ", messages)
	return (
		<>
			<div className='Chat-Box' style={{backgroundColor: "black", borderRadius: "10px"}}>
			{
				messages.length > 0 &&
				messages.map(message => (
					<div className="Message-Chats" key={message.id.toString()}>
						<p>{participants_map.get(message.appUserId)?.display_name}</p>
					<div className='Message-Text'>
						<p>{message.value}</p>
					</div>
				</div>))
			}
			<div ref={lastMessageRef} />
			</div>
		</>
	);
}

const ChatFooter = ({data_state, room} : {data_state : IUser, room: IRoom}) => {
	const [message, setMessage] : [string, any] = useState("");

	const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => 
	{
		e.preventDefault()
		if (message.trim() && (data_state.display_name as string).split(' ')[0]) {
			console.log(message);
			if (message[0] === '/') {
				const elements = message.substring(1, message.length).split(" ");
				console.log(elements);
				socket.emit(elements[0], 
					{
						text: elements.slice(1), 
						// name: (data_state.display_name as string).split(' ')[0], 
						// id: `${socket.id}${Math.random()}`,
						// socketID: socket.id,
					}, handleCallback);
				window.location.reload();
			}
			else if (room !== undefined)
			{
				socket.emit("message", 
					{
					text: message, 
					// name: (data_state.display_name as string).split(' ')[0], 
					// id: `${socket.id}${Math.random()}`,
					// socketID: socket.id,
					room: room.name
					}, handleCallback);
			}
			console.log("msg sent");
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

const pingFunc = (socket: Socket) =>
{
	socket.emit("ping");
}

const joinAll = (socket: Socket) =>
{
	socket.emit("join", "all");
}

function OwnerCommands({app_state, room, set_page, setIsInfoView} : {app_state: ISafeAppState, room: IRoom, set_page: any, setIsInfoView: any}) {
	const [owner, setOwner] : [boolean, any] = useState(false);

	useEffect(() => {
		console.log(room.administrators);
		if (room.administrators[0].id === app_state.data.id)
			setOwner(true);
	}, [room.administrators, app_state.data.id])

	if (owner === false) {
		return (
			<div>
			</div>
		)
	}
	const password = () => {
		const newPassword = prompt('Please enter the new password');
		if (newPassword === null)
			return ;
		let form_data: string[] = [];
		form_data.push(encodeURIComponent("room") + "=" + encodeURIComponent(room.name));
		form_data.push(encodeURIComponent("password") + "=" + encodeURIComponent(newPassword));
		console.log(form_data);
		fetch(endpoint.chat['password-change'], {
			method: "POST",
			body: form_data.join("&"),
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
	}

	const removePassword = () => {
		fetch(endpoint.chat['password-removal'], {
			method: "POST",
			body: encodeURIComponent("room") + "=" + encodeURIComponent(room.name),
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string
			}
		})
	}

	return (
		<div>
			<table>
				<tbody>
						<tr>
							<td>You're the owner here!</td>
							{/* { participant.id !== app_state.data.id && */}
								<td>
									{/* <button onClick={()=>{set_page("visit", participant.id)}}>&#x1f464;</button> */}
									<button onClick={()=>{password()}}>Set/Change Password</button>
									<button onClick={()=>{removePassword()}}>Remove Password</button>
									{/* <button onClick={()=>{mode(participant.id, "special")}}>Change Mode</button> */}
								</td>
						</tr>
					{/* )
				})} */}
				</tbody>
			</table>
		</div>
	)
}

//(app_state.data.data.full_name as string).split(' ')[0]
const ViewRoom = ({app_state, rooms, currentRoom, isInfoView, setIsInfoView, set_page} : {app_state : ISafeAppState, rooms: IRoom[], currentRoom: number, isInfoView: boolean, setIsInfoView: any, set_page: any}) => {
	if (isInfoView && rooms.length > 0) {
		return (
			<>
			<OwnerCommands setIsInfoView={setIsInfoView} app_state={app_state} room={rooms[currentRoom]} set_page={set_page}/>
			<Participants setIsInfoView={setIsInfoView} app_state={app_state} room={rooms[currentRoom]} set_page={set_page} />
			</>
		)
	} else {
		return (
			<>
				{rooms.length > 0 &&
					<ChatBody app_state={app_state} room={rooms[currentRoom]} /> }
				<ChatFooter data_state={app_state.data} room={rooms[currentRoom]} />
			</>
		)
	}
}

//Updating last message https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
export const Chat = ({app_state, set_page} : {app_state: ISafeAppState, set_page: any}) => {
	//const socket = io("https://localhost/chat");
	const [rooms, setRooms] : [IRoom[], any] = useState([]);
	const [currentRoom, setCurrentRoom] : [number, any] = useState(0);
	const [isInfoView, setIsInfoView] : [boolean, any] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(endpoint.chat.retrieve);
				const data: IRoom[] = await response.json();
				setRooms(data);
				console.log(data);
			} catch (err) {
				console.log(err);
			}
		}
		fetchData();
	}, [])

	useEffect(() => {
		console.log("one message of this kind only")
        //socket.emit("connection");
		/*socket.on("connection", (data: ChatMessage[]) => {
			console.log("connected socket, should be getting msg data")
			console.log(data);
			setMessages((prev_messages: ChatMessage[]) => ([
				...prev_messages,
				data
			]));
		});*/

		const eventListener = (event: any, ...args: any) => {
			console.log(event, args)
		}

		socket.onAny(eventListener);

		return () => {
			//socket.off('connection');
			//socket.off('disconnect');
			socket.offAny(eventListener);
		};
    }, []);
	
	return (
		<div className="Chat">
			<ChatBar socket={socket} app_state={app_state} rooms={rooms} set_room={setCurrentRoom} setIsInfoView={setIsInfoView} set_page={set_page} />
			<div className='Chat-Body'>
				<Header set_page={set_page} />
				<ViewRoom app_state={app_state} isInfoView={isInfoView} set_page={set_page} setIsInfoView={setIsInfoView} rooms={rooms} currentRoom={currentRoom} />
				<button onClick={() => pingFunc(socket)}>Ping</button>
				<button onClick={() => joinAll(socket)}>Join Room</button>
			</div>
		</div>
	)
};