import React from 'react';
import { Header } from './App';

export function Play({app_state, set_page} : {app_state: any, set_page: any}) {
	return (
		<div className="Play">
			<Header set_page={set_page} />
			<h1>Here you can play against other players</h1>
		</div>
	)
}