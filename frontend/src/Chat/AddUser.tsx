import React, { useState, useEffect } from 'react';
import { IRoom, IUserPublic, ISafeAppState } from '../Interfaces';
import { socket as chat_socket } from './Chat';
import endpoint from '../endpoint.json';

export const AddUser = ({app_state, room} : {app_state: ISafeAppState, room: IRoom}) => {
	const [foundUsers, setFoundUsers] : [IUserPublic[], any] = useState([]);
	const [textField, setTextField] : [string, any] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(endpoint.users['search-all'] + "?start=" + encodeURIComponent(textField));
				const data: IUserPublic[] = await response.json();
				setFoundUsers(data);
			} catch (err) {
				console.log(err);
			}
		}
		if (textField.length > 0) {
			fetchData();
		} else {
			setFoundUsers([])
		}
	}, [textField])

	const addToRoom = (userid: number, room_name: string) => {
		chat_socket.emit("addToRoom", { userid: userid, room_name: room_name}, (response: boolean) => {
			console.log("Operation ", response ? "successful" : "failed");
		});
	};

	return (
		<div>
			<input style={{backgroundColor: "white", borderRadius: "30px", border: "1px solid black", height: "30px", width: "50%"}} type="text" placeholder="Search..." value={textField} onChange={(event: React.FormEvent<HTMLInputElement>) => {setTextField((event.target as HTMLInputElement).value)}}/>
			<table className="Search-bar">
				<tbody>
				{ foundUsers.length > 0 &&
					foundUsers.map((user) => {
						return (
							<tr key={user.id}>
								<td>{user.display_name}</td>
								{user.id !== app_state.data.id && room.participants.filter((participant) => participant.id === user.id).length === 0 &&
									<td>
										<button onClick={()=>{addToRoom(user.id, room.name)}}>&#x2795;</button>
									</td>}
							</tr>
						)
					}) }
				</tbody>
			</table>
		</div>
	)
}