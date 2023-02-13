import React, { useState, useEffect } from 'react';
import { IRoom, IRoomAccess, ISafeAppState } from '../Interfaces';
import endpoint from '../endpoint.json';

export const OwnerCommands = ({app_state, room} : {app_state: ISafeAppState, room: IRoom}) => {
	const [owner, setOwner] : [boolean, any] = useState(false);

	useEffect(() => {
		if (room.owner.id === app_state.data.id)
			setOwner(true);
	}, [room.owner, app_state.data.id])

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

	if (owner === false || room.accessibility === IRoomAccess.DirectMessage) {
		return (
			<div>
			</div>
		)
	}
	return (
		<div>
			<table>
				<tbody>
					<tr>
						<td>You're the owner here!</td>
							<td>
								{/* <button onClick={()=>{set_page("visit", participant.id)}}>&#x1f464;</button> */}
								<button onClick={()=>{password()}}>Set/Change Password</button>
								<button onClick={()=>{removePassword()}}>Remove Password</button>
								{/* <button onClick={()=>{mode(participant.id, "special")}}>Change Mode</button> */}
							</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}
