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
		else if (newPassword.length < 5)
		{
			alert("The password should be longer than 5 characters");
			return ;
		}
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
		.then((res) => {
			if (!res.ok) {
				throw new Error("It was not possible to set the password")
			}
		})
		.catch((err: any) => {console.log(err)})
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
		.then((res) => {
			if (!res.ok) {
				throw new Error("It was not possible to remove the password")
			}
		})
		.catch((err: any) => {console.log(err)})
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
							<button onClick={()=>{password()}}>Set/Change Password</button>
							<button onClick={()=>{removePassword()}}>Remove Password</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}
