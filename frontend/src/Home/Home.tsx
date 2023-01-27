import React, { useState } from 'react';
import '../App.css';
import { LeftColumn } from './Left_column';
import { RightColumn } from '../Right_column';
import { Status, Header } from '../App';

function DisplayNamePrompt() {
	const [name, setName] : [name: string, setName: any] = useState("");
	const handleSubmit = (event: any) => {
		if (name.length > 0) {
			event.preventDefault();
			fetch("https://localhost/api/display_name", {
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

export function Home({app_state, set_page} : {app_state: any, set_page: any}) {
	return(
		<div className="Home">
		{ app_state.status === Status.Success && app_state.data.type === "content" && app_state.data.data.display_name === null &&
			<DisplayNamePrompt />}
			<LeftColumn result={app_state} />
			<Header set_page={set_page}/>
			<div className="Welcome-section">
				<h1>Welcome {app_state.data.data.display_name}</h1>
				<button className="button" onClick={() => {set_page("play")}}>
					Play
				</button>
			</div>
			<RightColumn app_state={app_state} set_page={set_page} />
		</div>
	)
}
