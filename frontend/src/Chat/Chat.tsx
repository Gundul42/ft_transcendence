import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Header, ISafeAppState } from '../App';
import { io } from 'socket.io-client';
import { IRoom, IUser, IUserPublic, IMessage } from '../Interfaces';
import { ClientEvents, ServerEvents } from '../events';
import endpoint from '../endpoint.json';
import { socket as game_socket } from '../Play/socket';
import { SearchBar } from './SearchBar';
import { RoomMaker } from './RoomMaker';
import { AddUser } from './AddUser';

export const socket = io("https://localhost/chat", {'transports': ['polling', 'websocket']});

function Participants({app_state, room, set_page, setIsInfoView} : {app_state: ISafeAppState, room: IRoom, set_page: any, setIsInfoView: any}) {
	const [idChallenged, setIdChallenged] : [number, any] = useState(0);
	const [admin, setAdmin] : [boolean, any] = useState(false);

	const challenge = (player2_id: number, mode: "classic" | "special") => {
		console.log("invitation is being sent")
		game_socket.emit(ClientEvents.Invite, { player2_id: player2_id, mode: mode}, (response: boolean) => {
			if (response) {
				setIdChallenged(player2_id);
			} else {
				alert("The other user is already ponging :(")
			}
		})
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
	}, [])

	useEffect(() => {
		console.log("checking if admin")
		room.administrators.map((admin) =>
		{
			if (admin.id === app_state.data.id)
				setAdmin(true);
			return (null);
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
	const banUser = (user_id: number) => {
		const reason = prompt("Reason for banning this user?")
		if (!reason)
			return (alert("Please don't use it for no reason"))
		let form_data: string[] = [];
		form_data.push(encodeURIComponent("room") + "=" + encodeURIComponent(room.name));
		form_data.push(encodeURIComponent("user") + "=" + encodeURIComponent(user_id));
		form_data.push(encodeURIComponent("reason") + "=" + encodeURIComponent(reason));
		fetch(endpoint.chat['user-ban'], {
			method: "POST",
			body: form_data.join('&'),
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
	};
	const muteUser = (user_id: number) => {
		const reason = prompt("Reason for muting this user?")
		if (!reason)
			return (alert("Please don't use it for no reason"))
		let form_data: string[] = [];
		form_data.push(encodeURIComponent("room") + "=" + encodeURIComponent(room.name));
		form_data.push(encodeURIComponent("user") + "=" + encodeURIComponent(user_id));
		form_data.push(encodeURIComponent("reason") + "=" + encodeURIComponent(reason));
		fetch(endpoint.chat['user-mute'], {
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
			{ room.administrators.filter((admin) => admin.id === app_state.data.id).length > 0 &&
				<AddUser app_state={app_state} room={room} />}
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
										<button onClick={()=>{kickUser(participant.id)}}>Kick</button>
										<button onClick={()=>{banUser(participant.id)}}>Ban</button>
										<button onClick={()=>{muteUser(participant.id)}}>Mute</button>
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
const ChatBar = ({app_state, rooms, messages, setCurrentRoom, setRooms, setIsInfoView, set_page, setUnreadRooms} : {app_state: ISafeAppState, rooms: Map<string, IRoom>, messages: Map<string, IMessage[]>, setCurrentRoom: any, setRooms: any, setIsInfoView: any, set_page: any, setUnreadRooms: any}) => {
	const room_access: string[] = ["Public", "Private", "PW required", "DM"];
	const room_arr: IRoom[] = Array.from(rooms.values());

	const changeCurrentRoom = (room: IRoom, className: string) => {
		setCurrentRoom(room.name);
		if (className === "unread" && messages.get(room.name) !== undefined) {
			window.localStorage.setItem(room.name, (messages.get(room.name) as IMessage[]).length.toString());
			setUnreadRooms((prev_unreadRooms: number) => (prev_unreadRooms - 1))
		}
	}

	return (
		<div className='Chat-Contacts'>
			<h2>Rooms and friends</h2>
			<SearchBar set_page={set_page} app_state={app_state} setRooms={setRooms} setCurrentRoom={setCurrentRoom} rooms={rooms} />
			<div>
				<div className='Text-field'>Users and Rooms</div>
				<table>
					<tbody>
						{ room_arr.map((room) => {
							let className: string;
							if (messages.get(room.name) !== undefined && (messages.get(room.name) as IMessage[]).length > (Number(window.localStorage.getItem(room.name)))) {
								className = "unread";
							} else {
								className = "read";
							}
							return (
								<tr key={room.id} className={className} onClick={()=>{changeCurrentRoom(room, className)}}>
									{ room.accessibility !== 3 &&
										<td>{room.name}</td> }
									{ room.accessibility === 3 &&
										<td>{room.participants.find((user) => user.id !== app_state.data.id)?.display_name}</td> }
									<td>{room_access[room.accessibility]}</td>
									<td><button onClick={()=> {setIsInfoView(true)}}>&#x2139;</button></td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
			<RoomMaker />
		</div>
	);
}

const handleCallback = (reply : string) =>
{
	console.log("callback", reply);
	alert(reply);
}

const ChatBody = ({app_state, room, messages} : {app_state : ISafeAppState, room: IRoom, messages: IMessage[]}) => { 
	const participants_map = new Map(room.participants.map((value) => [value.id, value]));
	const lastMessageRef = useRef<HTMLDivElement>(null);
	
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
					}, handleCallback);
				window.location.reload();
			}
			else if (room !== undefined)
			{
				socket.emit("message", 
					{
					text: message, 
					room: room.name
					}, handleCallback);
					window.localStorage.setItem(room.name, (Number(window.localStorage.getItem(room.name)) + 1).toString())
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

const ViewRoom = ({app_state, messages, setMessages, rooms, currentRoom, isInfoView, setIsInfoView, set_page} : {app_state : ISafeAppState, messages: Map<string, IMessage[]>, setMessages: any, rooms: Map<string, IRoom>, currentRoom: string, isInfoView: boolean, setIsInfoView: any, set_page: any}) => {
	let room: IRoom = rooms.get(currentRoom) as IRoom;
	let safe_messages: IMessage[] = messages.get(currentRoom) === undefined ? [] : (messages.get(currentRoom) as IMessage[]);

	if (isInfoView && rooms.get(currentRoom) !== undefined) {
		return (
			<>
				<OwnerCommands setIsInfoView={setIsInfoView} app_state={app_state} room={room} set_page={set_page}/>
				<Participants setIsInfoView={setIsInfoView} app_state={app_state} room={room} set_page={set_page} />
			</>
		)
	} else {
		return (
			<>
				{rooms.get(currentRoom) !== undefined &&
					<ChatBody app_state={app_state} room={room} messages={safe_messages} /> }
				<ChatFooter data_state={app_state.data} room={room} />
			</>
		)
	}
}

//Updating last message https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
export const Chat = ({app_state, set_page, unreadRooms, setUnreadRooms} : {app_state: ISafeAppState, set_page: any, unreadRooms: number, setUnreadRooms: any}) => {
	const [rooms, setRooms] : [Map<string, IRoom>, any] = useState(new Map<string, IRoom>);
	const [messages, setMessages] : [Map<string, IMessage[]>, any] = useState(new Map(Array.from(rooms, (room) => [room[1].name ,room[1].messages])));
	const [currentRoom, setCurrentRoom] : [string, any] = useState("");
	const [isInfoView, setIsInfoView] : [boolean, any] = useState(false);
	const blockedMap: Map<number, IUserPublic> = new Map(app_state.data.blocked.map((user) => [user.id, user]));

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(endpoint.chat.retrieve);
				const data: IRoom[] = await response.json();
				let n_unreadRooms: number = 0;
				setRooms(new Map(data.map((room) => [room.name, room])));
				data.forEach((room) => {
					if (room.messages.length > (Number(window.localStorage.getItem(room.name)))) {
						n_unreadRooms++;
					} else if (room.messages.length < (Number(window.localStorage.getItem(room.name)))) {
						window.localStorage.setItem(room.name, room.messages.length.toString());
					}
					setUnreadRooms(n_unreadRooms)
				})
			} catch (err) {
				console.log(err);
			}
		}
		fetchData();
	}, [])

	useEffect(() => {
		setMessages(new Map(Array.from(rooms, (room) => [room[1].name ,room[1].messages])));
	}, [rooms])

	useEffect(() => {
		const eventListener = (event: any, ...args: any) => {
			console.log(event, args)
		}

		socket.onAny(eventListener);
		socket.on("roomUpdate", ( data: {room: IRoom}) => {
			console.log("setting up new rooms")
			setRooms((prev_rooms: Map<string, IRoom>) => new Map(prev_rooms.set(data.room.name, data.room)));
		})
		socket.on("messageResponse", (data: IMessage) =>
		{
			if (blockedMap.get(data.appUserId) !== undefined) return;
			console.log("just received ", data)
			setMessages((prev_messages: Map<string, IMessage[]>) => {
				let safe_messages: IMessage[];
				if (prev_messages.get(data.room) === undefined) {
					safe_messages = [];
				} else {
					safe_messages = prev_messages.get(data.room) as IMessage[];
				}
				console.log(safe_messages)
				return new Map(messages.set(data.room, [...safe_messages, data]));
			});
		});

		return () => {
			socket.offAny(eventListener);
			socket.off("roomUpdate");
			socket.off('messageResponse');
		}
	}, [])
	
	return (
		<div className="Chat">
			<ChatBar app_state={app_state} rooms={rooms} messages={messages} setCurrentRoom={setCurrentRoom} setIsInfoView={setIsInfoView} set_page={set_page} setRooms={setRooms} setUnreadRooms={setUnreadRooms} />
			<div className='Chat-Body'>
				<Header set_page={set_page} />
				<ViewRoom app_state={app_state} messages={messages} setMessages={setMessages} isInfoView={isInfoView} set_page={set_page} setIsInfoView={setIsInfoView} rooms={rooms} currentRoom={currentRoom} />
				<button onClick={() => pingFunc(socket)}>Ping</button>
				<button onClick={() => joinAll(socket)}>Join Room</button>
			</div>
		</div>
	)
};