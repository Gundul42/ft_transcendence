import React from 'react';

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

function Achievements({achievements} : {achievements: any[]}) {
	return (
		<div id="Achievements">
			<h2 className="Section-title">Achievements</h2>
			{achievements.length === 0 &&
			<p>Congrats you achieved NOTHING</p>}
			{achievements.length > 0 &&
			achievements.map((achievement) => <p>{achievement}</p>)}
		</div>
	)
}

function MatchHistory({match_history} : {match_history: any[]}) {
	return (
		<div id="Match-history">
			<h2 className="Section-title">Match History</h2>
			{match_history.length === 0 &&
			<p>&#129335;</p>}
			{match_history.length > 0 &&
			match_history.map((match) => <p>{match}</p>)}
		</div>
	)
}

export function Dashboard({app_state} : {app_state: any}) {
	return (
		<div className="Dashboard">
			<div className="Dashboard-row">
				<LadderLevel ladder_level={app_state.data.data.ladder_level} />
				<WinsLosses wins={app_state.data.data.wins} losses={app_state.data.data.losses} />
			</div>
			<div className="Dashboard-row">
				<Achievements achievements={app_state.data.data.achievements} />
				<MatchHistory match_history={app_state.data.data.match_history} />
			</div>
		</div>
	)
}