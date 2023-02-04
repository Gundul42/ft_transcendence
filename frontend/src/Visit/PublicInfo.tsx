import React, { useState } from 'react';
import { IUserPublic, IUserRequest } from '../Interfaces';
import endpoint from '../endpoint.json';
import { ISafeAppState } from '../App';

export function PublicInfo({ user_info, app_state } : { user_info: IUserPublic, app_state: ISafeAppState }) {
	const [requests, setRequests] : [{received: (IUserRequest & { from: { display_name: string}})[], sent: IUserRequest[]}, any] = useState({
		received: app_state.data.requests_rec,
		sent: app_state.data.requests_sent
	});

	const sendFriendRequest = () => {
		fetch(endpoint.users['add-as-friend'] + "/" + user_info.id, {
			method: "POST",
			headers: { 'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
		.then((value) => {return value.json()})
		.then((data: {req_id: number}) => {
			setRequests((prevReq: {received: (IUserRequest & { from: { display_name: string}})[], sent: IUserRequest[]}) => ({
				received: prevReq.received,
				sent: prevReq.sent.concat([{ id: data.req_id, sender_id: app_state.data.id, receiver_id: user_info.id, type: "friend"}])
			}))
		})
		.catch((err: any) => {console.log(err)});
	};

	const removeFromFriends = () => {
		fetch(endpoint.users['remove-friend'] + "/" + user_info.id, {
			method: "POST",
			headers: { 'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
		.then(()=> window.location.reload())
		.catch((err: any) => {console.log(err)})
	}

	const statuses: string[] = ["Offline", "Online", "Playing"];
	const requests_userid: number[] = [...requests.received.map((rec) => rec.sender_id), ...requests.sent.map((sent) => sent.receiver_id)];
	const friends_map: Map<number, IUserPublic> = new Map(app_state.data.friends.map((friend) => [friend.id, friend]));
	return (
		<div className="Left-column">
			<img src={endpoint.content.img + "/" + user_info.avatar} alt="Avatar" className="Avatar-visit"/>
			<h2>{user_info.display_name}</h2>
			<div style={{width: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
				<p>{statuses[user_info.status]}&nbsp;</p>
				<div className={"circle" + user_info.status}/>
			</div>
			<div style={{display: "flex", height: "20%", width: "90%", justifyContent: "center"}}>
				{ !friends_map.has(user_info.id) && user_info.id !== app_state.data.id && !requests_userid.includes(user_info.id) &&
					<button className="tooltip-button" onClick={sendFriendRequest}><img src={endpoint.content.img + "/icons/add-user.png"} alt="add user" /></button>}
				{ friends_map.has(user_info.id) &&
					<button style={{backgroundColor: "rgb(238, 116, 116)"}} className="tooltip-button" onClick={removeFromFriends}><img src={endpoint.content.img + "/icons/remove-friend.png"} alt="remove friend" /></button>}
			</div>
		</div>
	)
}