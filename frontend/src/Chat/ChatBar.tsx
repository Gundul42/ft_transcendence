import React from 'react';
import { Socket } from 'socket.io-client';
import { RoomMaker } from './RoomMaker';
import { SearchBar } from './SearchBar';
import { IRoom, IMessage, ISafeAppState } from '../Interfaces';

export const ChatBar = (
	{app_state, rooms, messages, setCurrentRoom, setIsInfoView, set_page, setUnreadMessages, chat_socket} : 
	{app_state: ISafeAppState, rooms: Map<string, IRoom>, messages: Map<string, IMessage[]>, setCurrentRoom: any, setIsInfoView: any, set_page: any, setUnreadMessages: any, chat_socket: Socket}
	) => {
	const room_access: string[] = ["Public", "Private", "PW required", "DM"];
	const room_arr: IRoom[] = Array.from(rooms.values());

	const changeCurrentRoom = (room: IRoom, className: string) => {
		setCurrentRoom(room.name);
		if (className === "unread" && messages.get(room.name) !== undefined) {
			setUnreadMessages((prev_unreadMessages: number) => (prev_unreadMessages - (Number(window.localStorage.getItem(room.name)) - Number((messages.get(room.name) as IMessage[]).length))));
			window.localStorage.setItem(room.name, (messages.get(room.name) as IMessage[]).length.toString());
		}
	}

	return (
		<div className='Chat-Contacts'>
			<h2>Rooms and friends</h2>
			<SearchBar set_page={set_page} app_state={app_state} setCurrentRoom={setCurrentRoom} chat_socket={chat_socket} />
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
