import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import endpoint from '../endpoint.json';
import { IRoom, IRoomAccess, ISafeAppState, IUserPublic } from '../Interfaces';

export const SearchBar = ({set_page, setCurrentRoom, app_state, chat_socket} : {app_state: ISafeAppState, set_page: any, setCurrentRoom: any, chat_socket: Socket}) => {
	const [textField, setTextField] : [string, any] = useState("");
	const [foundUsers, setFoundUsers] : [IUserPublic[], any] = useState([]);
	const [foundRooms, setFoundRooms] : [IRoom[], any] = useState([]);
	const [password, setPassword] : [Map<number, string>, any] = useState(new Map<number, string>());
	const blockedMap: Map<number, IUserPublic> = new Map(app_state.data.blocked.map((user) => [user.id, user]));

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response_users = await fetch(endpoint.users['search-all'] + "?start=" + encodeURIComponent(textField));
				const response_rooms = await fetch(endpoint.chat['get-accessible-rooms'] + "?start=" + encodeURIComponent(textField));
				if (!response_rooms.ok || !response_users.ok) {
					throw new Error("Server error");
				}
				const user_data: IUserPublic[] = await response_users.json();
				const room_data: IRoom[] = await response_rooms.json();
				setFoundUsers(user_data);
				setFoundRooms(room_data);
			} catch (err) {
				console.log(err);
			}
		}
		if (textField.length > 0) {
			fetchData();
		} else {
			setFoundUsers([]);
			setFoundRooms([]);
		}
	}, [textField])

	const sendDirectMessage = (userid: number) => {
		chat_socket.emit("dm", { other_id: userid }, (room_name: string) => {
			if (room_name.length > 0) {
				setCurrentRoom(room_name);
			}
		});
	}

	const blockUser = (userid: number) => {
		fetch(endpoint.users.block, {
			method: "POST",
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'accept-encoding': 'gzip, deflate, br',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string
			},
			body: encodeURIComponent("uid") + "=" + encodeURIComponent(userid)
		})
		.then(
			() => {window.location.reload()},
			(err) => { console.log(err) }
		)
	}

	const unblockUser = (userid: number) => {
		fetch(endpoint.users.unblock, {
			method: "POST",
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'accept-encoding': 'gzip, deflate, br',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string
			},
			body: encodeURIComponent("uid") + "=" + encodeURIComponent(userid)
		})
		.then(
			() => {window.location.reload()},
			(err) => { console.log(err) }
		)
	}

	const joinRoom = (room: IRoom) => {
		if (password.get(room.id) === undefined && room.accessibility === IRoomAccess.PassProtected) return;
		chat_socket.emit("joinRoom", { room_name: room.name, password: password.get(room.id) === undefined ? "" : password.get(room.id)}, (response: boolean) => {
			if (response) {
				setCurrentRoom(room.name);
			}
		})
	}

	return (
		<div>
			<input className="Searchbar" type="text" placeholder="Search..." value={textField} onChange={(event: React.FormEvent<HTMLInputElement>) => {setTextField((event.target as HTMLInputElement).value)}}/>
			<table className="Searchbar-content"><tbody>
			{ foundUsers.length > 0 &&
				foundUsers.map((user) => {
					return (
						<tr key={user.id}>
							<td>{user.display_name}</td>
							{user.id !== app_state.data.id &&
								<td>
									<button onClick={()=>{set_page("visit", user.id)}}>&#x1f464;</button>
									<button onClick={()=>{sendDirectMessage(user.id)}}>&#128172;</button>
									{ blockedMap.get(user.id) === undefined &&
									<button onClick={()=>{blockUser(user.id)}}>&#128683;</button>}
									{ blockedMap.get(user.id) !== undefined &&
									<button onClick={()=>{unblockUser(user.id)}}>&#x2705;</button>}
								</td>}
						</tr>
					)
				})
			}
			{ foundRooms.length > 0 &&
				foundRooms.map((room) => {
					return (
						<tr key={room.id}>
							<td>{room.name}</td>
							{ room.accessibility === 2 && room.participants.filter((participant) => participant.id === app_state.data.id).length === 0 &&
								<td>
									<input type="password" placeholder="Password" value={password.get(room.id) === undefined ? "" : password.get(room.id)} onChange={(e: React.FormEvent<HTMLInputElement>) => {setPassword((prev_map: Map<number, string>) => new Map(prev_map.set(room.id, (e.target as HTMLInputElement).value)))}} required/>
								</td>}
							<td>
								<button onClick={()=>{joinRoom(room)}}>&#128172;</button>
							</td>
						</tr>
					)
				})
			}
			</tbody></table>
		</div>
	)
}