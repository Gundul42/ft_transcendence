import React from 'react';
import { IAppState } from '../App';
import '../App.css';
import { IMatch, IUser } from '../Interfaces';

function Friends({friends_list} : {friends_list: IUser[]}) {
	return (
		<div className="Friends">
			<h2>Friends</h2>
			{ friends_list.length > 0 &&
				friends_list.map((friend) => (
					<React.Fragment>
					<p className="Friend">{friend.display_name}</p><div className={"circle" + friend.status.toString()}></div>
					</React.Fragment>
				))
			}
			{ friends_list.length === 0 &&
				<p className="filler">Devastating loneliness</p>}
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
		return (
			<div className="Left-column">
				<Friends friends_list={app_state.data.data.friends}/>
				<Matches active_matches={[]} />
			</div>
		)
	} else {
		return(
			<div className="Left-column"></div>
		)
	}
}