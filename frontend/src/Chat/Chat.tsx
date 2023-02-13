import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ChatBar } from './ChatBar';
import { ChatBody } from './ChatBody';
import { ChatFooter } from './ChatFooter';
import { Header } from '../Header';
import { InfoRoom } from './InfoRoom';
import { OwnerCommands } from './OwnerCommands';
import { IRoom, IUserPublic, IMessage, ISafeAppState, IRoomAccess } from '../Interfaces';
import { ClientEvents, ServerEvents } from '../events';
import endpoint from '../endpoint.json';

export const socket = io("https://localhost/chat", {
	'transports': ['polling', 'websocket'],
	extraHeaders: {
		'Authorization': "Bearer " + localStorage.getItem("csrf_token") as string
	}
});

const ViewRoom = ({app_state, messages, rooms, currentRoom, isInfoView, setIsInfoView, set_page} : {app_state : ISafeAppState, messages: Map<string, IMessage[]>, rooms: Map<string, IRoom>, currentRoom: string, isInfoView: boolean, setIsInfoView: any, set_page: any}) => {
	let room: IRoom = rooms.get(currentRoom) as IRoom;
	let safe_messages: IMessage[] = messages.get(currentRoom) === undefined ? [] : (messages.get(currentRoom) as IMessage[]);

	if (isInfoView && rooms.get(currentRoom) !== undefined) {
		return (
			<>
				<OwnerCommands app_state={app_state} room={room} />
				<InfoRoom setIsInfoView={setIsInfoView} app_state={app_state} room={room} set_page={set_page} />
			</>
		)
	} else {
		return (
			<>
				{rooms.get(currentRoom) !== undefined &&
					<ChatBody room={room} messages={safe_messages} /> }
				<ChatFooter data_state={app_state.data} room={room} />
			</>
		)
	}
}

export const Chat = ({app_state, set_page, setUnreadRooms} : {app_state: ISafeAppState, set_page: any, setUnreadRooms: any}) => {
	const [rooms, setRooms] : [Map<string, IRoom>, any] = useState(new Map<string, IRoom>());
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
				<ViewRoom app_state={app_state} messages={messages} isInfoView={isInfoView} set_page={set_page} setIsInfoView={setIsInfoView} rooms={rooms} currentRoom={currentRoom} />
			</div>
		</div>
	)
};