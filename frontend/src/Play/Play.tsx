import React from 'react';
import { Header, ISafeAppState } from '../App';

export function Play({app_state, set_page} : {app_state: ISafeAppState, set_page: any}) {
	return (
		<div className="Play">
			<Header set_page={set_page} />
			<h1>Here you can play against other players</h1>
		</div>
	)
}