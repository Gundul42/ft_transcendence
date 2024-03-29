import React, { useState } from 'react';
import endpoint from '../endpoint.json';
import { IRoomAccess } from '../Interfaces';

export const RoomMaker = () => {
	const [roomName, setRoomName] : [string, any] = useState("");
	const [chosenAccessMode, setChosenAccessMode] : [number, any] = useState(0);
	const [password, setPassword] : [string, any] = useState("");
	const room_access: string[] = ["Public", "Private", "Protected"];

	const createRoom = () => {
		if (roomName.length === 0 ) return ;
		if (password.length < 5 && chosenAccessMode === IRoomAccess.PassProtected) {
			alert("Password needs to be at least 5 characters long");
			return ;
		} else if (password.length > 128  && chosenAccessMode === IRoomAccess.PassProtected) {
			alert("The password can be 128 characters long maximum");
			return ;
		}
		let form_data: string[] = [];
		form_data.push(encodeURIComponent("access_mode") + "=" + encodeURIComponent(chosenAccessMode));
		form_data.push(encodeURIComponent("password") + "=" + encodeURIComponent(password));
		form_data.push(encodeURIComponent("name") + "=" + encodeURIComponent(roomName));
		fetch(endpoint.chat['create-room'], {
			method: "POST",
			body: form_data.join('&'),
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
			}
		)
		.then((response) => {
			if (response.ok) {
				return window.location.reload();
			}
			throw new Error("Request not valid");
		})
		.catch((err: any) => {
			console.log(err);
			alert("A room with this name already exists")
		})
	}

	return (
		<div className="Room-maker">
			<div className="Room-create">
				<input type="text" placeholder="Choose a name" value={roomName} onChange={(e: React.FormEvent<HTMLInputElement>) => {setRoomName((e.target as HTMLInputElement).value)}} />
				{ chosenAccessMode === 2 &&
					<>
					<div className="break"></div>
					<input type="password" placeholder="Password" minLength={5} value={password} onChange={(e: React.FormEvent<HTMLInputElement>) => {setPassword((e.target as HTMLInputElement).value)}} required/>
					</>}
				<div className="break"></div>
				<div>
					{room_access.map((access_mode, i) => {
						return (
							<label key={i}>
								<input type="radio" value={i} checked={chosenAccessMode === i} onChange={() => {setChosenAccessMode(i); setPassword("")}} />
								{access_mode}
							</label>
						)
					})}
				</div>
			</div>
			<button className="button" onClick={createRoom}>Create</button>
		</div>
	)
}