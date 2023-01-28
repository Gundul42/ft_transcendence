import React from 'react';
import Ball from './Components/ball'
import Paddle from './Components/paddle';
import PongField from './Components/pongfield';
import { setWindowSizeLimit } from './Components/helpers';
import { Header, ISafeAppState } from '../App';

	window.addEventListener("resize", setWindowSizeLimit);

export function Play({app_state, set_page} : {app_state: ISafeAppState, set_page: any}) {
	return (
		<div className="Play">
			<PongField />
			<Header set_page={set_page} />
			<Ball x={100} y={50} />
			<Paddle y={600} isLeft = {false} />
			<Paddle y={250} isLeft = {true} />
		</div>
	)
}