import React, { useState, useEffect } from 'react';
import { socket } from '../Play/socket';
import { LeftColumn } from './Left_column';
import { RightColumn } from '../Right_column';
import { Status, Header, ISafeAppState, IAppState } from '../App';
import endpoint from '../endpoint.json'
import { ClientEvents, ServerEvents } from '../events';
import { IAchieve } from '../Interfaces';

function DisplayNamePrompt() {
	const [name, setName] : [name: string, setName: any] = useState("");
	const handleSubmit = (event: any) => {
		if (name.length > 0) {
			event.preventDefault();
			fetch(endpoint.content.display_name, {
				method: "POST",
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'accept-encoding': 'gzip, deflate, br',
					'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string
				},
				body: encodeURIComponent("uname") + "=" + encodeURIComponent(name)
			})
			.then(
				() => { window.location.reload() },
				(err) => { console.log(err) }
			)
		}
	}
	return(
		<div className="Wall">
			<h1>It looks like you don't have a username yet!</h1>
			<form onSubmit={handleSubmit}>
				<label htmlFor="uname">Set a username: </label>
				<input type="text" name="uname" id="uname" placeholder="LivingLegend42" value={name} onChange={(e) => {setName(e.target.value)}} required />
				<input type="submit" value="Submit"/>
			</form>
		</div>
	)
}

function DisplayAchievement({achievement} : {achievement: IAchieve}) {
	const handleClick = () => {
		fetch(endpoint.achievement.aknowledge + "/" + achievement.id.toString(), {
			method: "POST",
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'accept-encoding': 'gzip, deflate, br',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string
			},
		})
		.then(
			() => { window.location.reload() },
			(err) => { console.log(err) }
		)
	};

	return(
		<div className="Wall">
			<h1>{achievement.name}</h1>
			<img src={endpoint.content.img + achievement.logo} alt={achievement.logo} style={{height: "20%", aspectRatio: "1 / 1", borderRadius: "50%", border: "5px solid black"}} />
			<p>{achievement.description}</p>
			<button className="button" onClick={handleClick}>Nice</button>
		</div>
	)
}

function PlayButton({setClicked, mode} : {setClicked: any, mode: string}) {
	return (
		<button className="button" onClick={() => {setClicked(true); socket.emit(ClientEvents.Play, { mode: mode })}}>
			{mode[0].toUpperCase() + mode.slice(1)}
		</button>
	)
}

function Loading({setClicked} : {setClicked: any}) {
	return (
		<div>
			<div className="lds-ring"><div></div><div></div><div></div><div></div></div>
			<div className="break"></div>
			<button className="button" onClick={() => {setClicked(false); socket.emit(ClientEvents.Cancel)}}>
				Cancel
			</button>
		</div>
	)
}

export function Home({app_state, set_page} : {app_state: ISafeAppState, set_page: any}) {
	const [isClicked, setClicked] : [boolean, any] = useState(false);

	useEffect(() => {
		socket.on(ServerEvents.Ready, () => {
			set_page("play");
		});

		return () => {
			socket.off(ServerEvents.Ready);
		};
	}, []);

	let converter: IAppState = {
		status: app_state.status,
		data: {
			type: "content",
			link: null,
			data: app_state.data
		},
		page: app_state.page
	}
	return(
		<div className="Home">
			{ app_state.status === Status.Success && app_state.data.display_name === null &&
				<DisplayNamePrompt />}
			{ app_state.data.achievements.length > 0 && !app_state.data.achievements[0].aknowledged &&
				<DisplayAchievement achievement={app_state.data.achievements[0]} /> }
			<LeftColumn app_state={converter} set_page={set_page} />
			<Header set_page={set_page}/>
			<div className="Welcome-section">
				<h1>Welcome {app_state.data.display_name}</h1>
				<h2>Choose a mode and play</h2>
				<div style={{display: "flex", gap: "20px"}}>
					{!isClicked &&
						<PlayButton setClicked={setClicked} mode="classic"/>}
					{!isClicked &&
						<PlayButton setClicked={setClicked} mode="special"/>}
					{isClicked &&
						<Loading setClicked={setClicked} />}
				</div>
				<div className="break"></div>
				<p>In the special mode the ball is going to get faster every round</p>
			</div>
			<RightColumn app_state={converter} set_page={set_page} />
		</div>
	)
}
