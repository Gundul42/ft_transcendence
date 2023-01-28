import React from 'react';
import Ball from './Components/ball'
import Paddle from './Components/paddle';
import PongField from './Components/pongfield';
import { setWindowSizeLimit } from './Components/helpers';
import { Header, ISafeAppState } from '../App';
import { useEffect, useRef, useState } from 'react';


export function Play({app_state, set_page} : {app_state: ISafeAppState, set_page: any}) {
	const [count, setCount] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCount(count + 1);
			// maybe put fetchdata from backend here ?
		}, 10);
		return () => clearInterval(interval);
		}, [count]);

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