import React from 'react';
import { IAppState, ISafeAppState } from '../App';
import { UserPublic } from '../UserPublic';
import { IMatch, IUser, IUserRequest } from '../Interfaces';
import endpoint from '../endpoint.json'

function Requests({requests} : {requests: (IUserRequest & {from: {display_name: string}})[] }) {
	const respond = (accept: boolean, req_id: number) => {
		let form_body: string[] = [];
		form_body.push(encodeURIComponent("res") + "=" + encodeURIComponent(accept));
		form_body.push(encodeURIComponent("req_id") + "=" + encodeURIComponent(req_id));
		fetch(endpoint.users.respond, {
			method: "POST",
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'accept-encoding': 'gzip, deflate, br',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string
			},
			body: form_body.join("&")
		})
		.then(
			() => { window.location.reload() },
			(err) => { console.log(err) }
		)
	};

	return(
		<div className="Requests">
			<h2>Requests</h2>
			<table style={{width: "100%"}}>
			{ requests.map((req: IUserRequest & {from: {display_name: string}}) => (
					<tr className="record" key={req.id}>
						<td className="record-name">{req.from.display_name}</td>
						<td className="record-buttons">
							<button className="Check-button" onClick={()=>{respond(true, req.id)}}>&#10003;</button>
							<button className="Cancellation-button" onClick={()=>{respond(false, req.id)}}>&#10006;</button>
						</td>
					</tr>
				))
			}
			</table>
		</div>
	)
}

function Friends({user_info, app_state} : {user_info: IUser, app_state: ISafeAppState}) {
	return (
		<div className="Friends">
			{ user_info.requests_rec.length > 0 &&
				<Requests requests={user_info.requests_rec} />}
			<div className="Friends-list">
				<h2>Friends</h2>
				{ user_info.friends.length > 0 &&
					user_info.friends.map((friend) => (
						<div className="list" key={friend.id}>
							<UserPublic user_info={friend} app_state={app_state} display_img={false} display_status={true} />
						</div>
					))
				}
				{ user_info.friends.length === 0 &&
					<p className="filler">Devastating loneliness</p>}
			</div>
		</div>
	)
}

function Matches({active_matches} : {active_matches: IMatch[]})
{
	//ToDO
	return (
		<div className="Matches">
			<h2>Ongoing Matches</h2>
			{ active_matches.length > 0 &&
				active_matches.map((match) => (
					<p className="Friend">{match.player1.display_name} | {match.player2.display_name}</p>
				))
			}
			{ active_matches.length === 0 &&
				<p className="filler">Nobody is ponging today</p>}
		</div>
	)
}

export function LeftColumn({app_state} : {app_state: IAppState}) {
	if (app_state.data !== null && app_state.data.data !== null && app_state.data.type === "content") {
		const converter: ISafeAppState = {
			status: app_state.status,
			data: app_state.data.data,
			page: app_state.page
		}
		return (
			<div className="Left-column">
				<Friends user_info={app_state.data.data} app_state={converter} />
				<Matches active_matches={[]} />
			</div>
		)
	} else {
		return(
			<div className="Left-column"></div>
		)
	}
}