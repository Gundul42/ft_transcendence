import React from 'react';
import { RoomMaker } from './RoomMaker';
import { SearchBar } from './SearchBar';
import { IRoom, IMessage, ISafeAppState } from '../Interfaces';

export const ChatBar = ({app_state, rooms, messages, setCurrentRoom, setRooms, setIsInfoView, set_page, setUnreadRooms} : {app_state: ISafeAppState, rooms: Map<string, IRoom>, messages: Map<string, IMessage[]>, setCurrentRoom: any, setRooms: any, setIsInfoView: any, set_page: any, setUnreadRooms: any}) => {
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
