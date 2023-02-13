import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { UserPublic } from '../UserPublic';
import { IcurrentMatch, IUser, IUserRequest, ISafeAppState } from '../Interfaces';
import { ServerEvents, ClientEvents } from '../events';
import endpoint from '../endpoint.json'

const Requests = ({requests} : {requests: (IUserRequest & {from: {display_name: string}})[] }) => {
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
		.then((res) => {
			if (!res.ok) {
				throw new Error("It was not possible to respond the request");
			}
			window.location.reload();
		})
		.catch((err: any) => {console.log(err)})
	};

	return(
		<div className="Requests">
			<h2>Requests</h2>
			<table className="clickable">
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

const Friends = ({user_info, app_state, set_page} : {user_info: IUser, app_state: ISafeAppState, set_page: any}) => {
	return (
		<div className="Friends">
			{ user_info.requests_rec.length > 0 &&
				<Requests requests={user_info.requests_rec} />}
			<div className="Friends-list">
				<h2>Friends</h2>
				{ user_info.friends.length > 0 &&
					user_info.friends.map((friend) => (
						<div className="list" key={friend.id}>
							<UserPublic user_info={friend} app_state={app_state} display_img={false} display_status={true} set_page={set_page} />
						</div>
					))
				}
				{ user_info.friends.length === 0 &&
					<p className="filler">Devastating loneliness</p>}
			</div>
		</div>
	)
}


const Matches = ({set_page, game_socket} : {set_page : any, game_socket: Socket}) => {
	const [active_matches, setActiveMatches] : [IcurrentMatch[], any] = useState([]);

	useEffect(() => {
		game_socket.on(ServerEvents.GlobalState, (data: IcurrentMatch[]) => {
			setActiveMatches(data);
		});

		return () => {
			game_socket.off(ServerEvents.GlobalState);
		};
	}, []);
	
	const watch = (id : string) => {
		game_socket.emit(ClientEvents.Watch, {lobbyId: id});
		set_page("play");
	};

	return (
		<div className="Matches">
			<h2>Ongoing Matches</h2>
			<table className="clickable"><tbody>
			{ active_matches.length > 0 && 
					active_matches.map((active_match, i, arr) => {
						if (active_match === null) return <></>;
						return (
							<tr key={active_match.id}>
								<td onClick={() => {watch(active_match.id)}} key={active_match.id}>{active_match.player1.display_name} V/S {active_match.player2.display_name}</td>
							</tr>
						)
					})
			}
			</tbody></table>
			{ active_matches.length === 0 &&
				<p className="filler">Nobody is ponging today</p>}
		</div>
	)
}

export const LeftColumn = ({app_state, set_page, game_socket} : {app_state: ISafeAppState, set_page: any, game_socket: Socket}) => {
	return (
		<div className="Left-column">
			<Friends user_info={app_state.data} app_state={app_state} set_page={set_page} />
			<Matches set_page={set_page} game_socket={game_socket} />
		</div>
	)
}