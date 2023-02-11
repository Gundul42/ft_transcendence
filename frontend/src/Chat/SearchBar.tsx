import React, { useState, useEffect } from 'react';
import { ISafeAppState } from '../App';
import endpoint from '../endpoint.json';
import { IRoom, IUserPublic } from '../Interfaces';
import { socket as chat_socket } from './Chat';

export const SearchBar = ({rooms, set_page, setRooms, setCurrentRoom, app_state} : {rooms: Map<string, IRoom>, app_state: ISafeAppState, set_page: any, setRooms: any, setCurrentRoom: any}) => {
	const [textField, setTextField] : [string, any] = useState("");
	const [foundUsers, setFoundUsers] : [IUserPublic[], any] = useState([]);
	const blockedMap: Map<number, IUserPublic> = new Map(app_state.data.blocked.map((user) => [user.id, user]));

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


	return (
		<div>
			<input style={{backgroundColor: "white", borderRadius: "30px", border: "1px solid black", height: "30px", width: "95%"}} type="text" placeholder="Search..." value={textField} onChange={(event: React.FormEvent<HTMLInputElement>) => {setTextField((event.target as HTMLInputElement).value)}}/>
			<table className="Search-bar">
				<tbody>
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
					}) }
				</tbody>
			</table>
		</div>
	)
}