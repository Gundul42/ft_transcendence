import React from 'react';
import { Header } from '../App';
import Ball from './Components/ball'
import Paddle from './Components/paddle';

export function Play({app_state, set_page} : {app_state: any, set_page: any}) {
	return (
		<div className="Play">
			<Header set_page={set_page} />
			<h1>Here you can play against other players</h1>
			<Ball x={100} y={50} />
			<Paddle y={500} />
		</div>
	)
}