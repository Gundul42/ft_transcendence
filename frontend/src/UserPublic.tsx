import React, { useState } from 'react';
import { IUserPublic, IUserRequest } from './Interfaces';
import endpoint from './endpoint.json';
import { ISafeAppState } from './App';

function UserTooltip({user_info, app_state} : {user_info: IUserPublic, app_state: ISafeAppState}) {
	const [requests, setRequests] : [{received: (IUserRequest & { from: { display_name: string}})[], sent: IUserRequest[]}, any] = useState({
		received: app_state.data.requests_rec,
		sent: app_state.data.requests_sent
	});

	const sendFriendRequest = () => {
		fetch(endpoint.users['add-as-friend'] + "/" + user_info.id, {
			method: "POST",
			headers: { 'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
		.then(()=> {console.log("success")})
		.catch((err: any) => {console.log(err)});
		setRequests((prevReq: {received: (IUserRequest & { from: { display_name: string}})[], sent: IUserRequest[]}) => ({
			received: prevReq.received,
			sent: prevReq.sent.concat([{ id: 0, sender_id: app_state.data.id, receiver_id: user_info.id, type: "friend"}])
		}))
	};
	
	const visitProfile = () => {
		console.log("visiting profile");
	};
	const requests_userid: number[] = [...requests.received.map((rec) => rec.sender_id), ...requests.sent.map((sent) => sent.receiver_id)];
	const friends_map: Map<number, IUserPublic> = new Map(app_state.data.friends.map((friend) => [friend.id, friend]));
	return (
		<div className="tooltip">
			<img src={endpoint.content.img + "/" + user_info.avatar} alt="avatar" />
			<p>{user_info.display_name}</p>
			<div style={{display: "flex", height: "20%", width: "90%", justifyContent: "center"}}>
				{ !friends_map.has(user_info.id) && user_info.id !== app_state.data.id && !requests_userid.includes(user_info.id) &&
					<button className="tooltip-button" onClick={sendFriendRequest}><img src={endpoint.content.img + "/icons/add-user.png"} alt="add user" /></button>}
				{ app_state.page !== "play" &&
					<button className="tooltip-button" onClick={visitProfile}><img src={endpoint.content.img + "/icons/user.png"} alt="visit" /></button>}
			</div>
		</div>
	)
}

export function UserPublic({user_info, app_state, display_status, display_img} : {user_info: IUserPublic, app_state: ISafeAppState, display_img: boolean, display_status: boolean}) {
	return (
		<div className="User-public">
			<UserTooltip user_info={user_info} app_state={app_state} />
			{display_img &&
				<img src={endpoint.content.img + "/" + user_info.avatar} alt="pic" />}
			<p style={{padding: "5px"}}>{user_info.display_name}</p>
			{display_status &&
				<div className={"circle" + user_info.status.toString()}></div>}
		</div>
	)
}