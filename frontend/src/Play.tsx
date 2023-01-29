import React from 'react';
import { Header } from './App';
import Game from './comps/Game.jsx';


export function Play({app_state, set_page} : {app_state: any, set_page: any}) {
	return (
		<div className="Play">
			<Game />
		</div>
	)
}
