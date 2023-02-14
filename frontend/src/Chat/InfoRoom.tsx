import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { AddUser } from './AddUser';
import { IRoom, IRoomAccess, ISafeAppState } from '../Interfaces';
import { ClientEvents, ServerEvents } from '../events';
import endpoint from '../endpoint.json';

export const InfoRoom = ({app_state, room, set_page, setIsInfoView, game_socket, chat_socket} : {app_state: ISafeAppState, room: IRoom, set_page: any, setIsInfoView: any, game_socket: Socket, chat_socket: Socket}) => {
	const [idChallenged, setIdChallenged] : [number, any] = useState(0);
	const [admin, setAdmin] : [boolean, any] = useState(false);

	const challenge = (player2_id: number, mode: "classic" | "special") => {
		console.log("invitation is being sent")
		game_socket.emit(ClientEvents.Invite, { player2_id: player2_id, mode: mode}, (response: boolean) => {
			if (response) {
				setIdChallenged(player2_id);
			} else {
				alert("The other user cannot pong with you at the moment :(")
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
		// const time = prompt("How long should this penalty last? (minutes)")
		// if (!time)
		// 	return (alert("Please input the penalty time!"))
		let form_data: string[] = [];
		form_data.push(encodeURIComponent("room") + "=" + encodeURIComponent(room.name));
		form_data.push(encodeURIComponent("user") + "=" + encodeURIComponent(user_id));
		// form_data.push(encodeURIComponent("time") + "=" + encodeURIComponent(time));
		fetch(endpoint.chat['user-kick'], {
			method: "POST",
			body: form_data.join('&'),
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
		.then(async (response) => {
			if (!response.ok) {
				throw new Error((await response.json()).message)
			} else {
				alert(await response.text())
			}
		})
		.catch((err: any) => {alert(err)})
	};
	const banUser = (user_id: number) => {
		const time = prompt("How long should this penalty last? (minutes)")
		if (!time)
			return (alert("Please input the penalty time!"))
		let form_data: string[] = [];
		form_data.push(encodeURIComponent("room") + "=" + encodeURIComponent(room.name));
		form_data.push(encodeURIComponent("user") + "=" + encodeURIComponent(user_id));
		form_data.push(encodeURIComponent("time") + "=" + encodeURIComponent(time));
		fetch(endpoint.chat['user-ban'], {
			method: "POST",
			body: form_data.join('&'),
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
		.then(async (response) => {
			if (!response.ok) {
				throw new Error((await response.json()).message)
			} else {
				alert(await response.text())
			}
		})
		.catch((err: any) => {alert(err)})
	};
	const muteUser = (user_id: number) => {
		const time = prompt("How long should this penalty last? (minutes)")
		if (!time)
			return (alert("Please input the penalty time!"))
		let form_data: string[] = [];
		form_data.push(encodeURIComponent("room") + "=" + encodeURIComponent(room.name));
		form_data.push(encodeURIComponent("user") + "=" + encodeURIComponent(user_id));
		form_data.push(encodeURIComponent("time") + "=" + encodeURIComponent(time));
		fetch(endpoint.chat['user-mute'], {
			method: "POST",
			body: form_data.join('&'),
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
		.then(async (response) => {
			if (!response.ok) {
				throw new Error((await response.json()).message)
			} else {
				alert(await response.text())
			}
		})
		.catch((err: any) => {alert(err)})
	};

	const leaveRoom = () => {
		chat_socket.emit("leaveRoom", {room_name: room.name}, (response: boolean) => {
			if (response) {
				window.location.reload();
			}
		});
	}

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
		<div className="Info-room">
			{ room.administrators.filter((admin) => admin.id === app_state.data.id).length > 0 &&
				<AddUser app_state={app_state} room={room} chat_socket={chat_socket} />}
			<div>
			<div className="Text-field">Participants</div>
			<table><tbody>
				{room.participants.map((participant, id) => {
					return (
						<tr key={id}>
							<td>{participant.display_name}</td>
							{ participant.id !== app_state.data.id &&
								<td>
									<button onClick={()=>{set_page("visit", participant.id)}}>&#x1f464;</button>
									<button onClick={()=>{challenge(participant.id, "classic")}}>Challenge | Classic</button>
									<button onClick={()=>{challenge(participant.id, "special")}}>Challenge | Special</button>
									{ admin === true && room.accessibility !== 3 &&
										<>
										<button onClick={()=>{kickUser(participant.id)}}>Kick</button>
										<button onClick={()=>{banUser(participant.id)}}>Ban</button>
										<button onClick={()=>{muteUser(participant.id)}}>Mute</button>
										</>
									}
									{ room.accessibility !== 3 && room.owner.id === app_state.data.id && room.administrators.includes(participant) === false && 
									<button onClick={()=>{promoteAdmin(participant.id)}}>Promote to admin</button>
									}

								</td>}
						</tr>
					)
				})}
				</tbody></table>
				</div>
			<div>
			<button onClick={()=> {setIsInfoView(false)}}>Close</button>
			{ room.accessibility !== IRoomAccess.DirectMessage &&
				<button style={{backgroundColor: "red"}} onClick={()=> {leaveRoom()}}>Leave</button>}
			</div>
		</div>
	)
}
