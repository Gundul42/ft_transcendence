import React from 'react';
import './App.css';
import { LeftColumn } from './Left_column';
import { RightColumn } from './Right_column';
import { Status, Header } from './App';


function DisplayNamePrompt() {
	return(
	  <div className="Display-name-prompt">
		<h1>It looks like you don't have a username yet!</h1>
		<form action="https://localhost/api/display_name" method="post">
		  <label htmlFor="uname">Set a username: </label>
		  <input type="text" name="uname" id="uname" placeholder="LivingLegend42"/>
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
				<h1>Welcome {(app_state.data.data.full_name as string).split(' ')[0]}</h1>
				<button className="button" type="submit" formMethod="get" formAction="https://localhost/play/matchmaking" onClick={() => {set_page("play")}}>
					Play
				</button>
			</div>
			<RightColumn result={app_state} set_page={set_page} />
		</div>
	)
}
