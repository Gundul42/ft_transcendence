import React from 'react';
import { IAchieve, IMatch, IUserPublicPage } from '../Interfaces';

function LadderLevel({ladder_level} : {ladder_level : number}) {
	return (
		<div id="Ladder-level">
			<h2 className="Section-title">Ladder Level</h2>
			<p>Your ladder level is:</p>
			<div className="break"></div>
			<h3>{ladder_level}</h3>
		</div>
	)
}

function WinsLosses({wins, losses} : {wins: number, losses: number}) {
	return (
		<div id="Wins-losses">
			<h2 className="Section-title">Wins vs Losses</h2>
			<p>Wins: <b>{wins}</b></p>
			<div className="break"></div>
			<p>Losses: <b>{losses}</b></p>
		</div>
	)
}

function Achievements({achievements} : {achievements: IAchieve[]}) {
	return (
		<div id="Achievements">
			<h2 className="Section-title">Achievements</h2>
			{achievements.length === 0 &&
			<p>Congrats you achieved NOTHING</p>}
			{achievements.length > 0 &&
			achievements.map(achievement => <li>{achievement.description}</li>)}
		</div>
	)
}

function MatchHistory({match_history, userid} : {match_history: IMatch[], userid: number}) {
	const match_list = () => {
		return (
			match_history.map((match) => {
				let has_won: string;
				if (match.winner_id === userid) {
					has_won = "Match-won";
				} else {
					has_won = "Match-lost";
				}
				return (
					<tr key={match.id} className={has_won}>
						<td>{match.winner.display_name}</td>
						<td style={{width: "45%"}}>V/S</td>
						<td>{match.loser.display_name}</td>
					</tr>
				)
			})
		)
	};
	return (
		<div id="Match-history">
			<h2 className="Section-title">Match History</h2>
			{match_history.length === 0 &&
			<p>&#129335;</p>}
			{match_history.length > 0 &&
				<table style={{borderCollapse: "collapse", width: "90%", overflowY: "scroll", overflowX: "hidden"}}>
					<tbody>
						{match_list()}
					</tbody>
				</table>
			}
		</div>
	)
}

export function Dashboard({user_info} : {user_info: IUserPublicPage}) {
	return (
		<div className="Dashboard">
			<div className="Dashboard-row">
				<LadderLevel ladder_level={user_info.ladder_level} />
				<WinsLosses wins={user_info.wins} losses={user_info.losses} />
			</div>
			<div className="Dashboard-row">
				<Achievements achievements={user_info.achievements} />
				<MatchHistory userid={user_info.id} match_history={user_info.match_history} />
			</div>
		</div>
	)
}