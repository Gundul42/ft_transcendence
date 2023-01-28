import React from 'react';
import Ball from './Components/ball'
import Paddle from './Components/paddle';
import PongField from './Components/pongfield';
import { setWindowSizeLimit } from './Components/helpers';
import { Header, ISafeAppState } from '../App';
import { useEffect, useRef, useState } from 'react';
import { moveIt } from './Components/moveIt';
import { Ballpos } from './Components/ball';


export function Play({app_state, set_page, ballz} : {app_state: ISafeAppState, set_page: any, ballz:Ballpos} ){
	const [count, setCount] = useState(0);
	

	useEffect(() => {
		const interval = setInterval(() => {
			setCount(count + 1);
		}, 10);
		return () => clearInterval(interval);
		}, [count]);
		moveIt(ballz);

	return (
		<div className="Play">
			<PongField />
			<Header set_page={set_page} />
			<Ball x={ballz.posx} y={ballz.posy} />
			<Paddle y={600} isLeft = {false} />
			<Paddle y={250} isLeft = {true} />
		</div>
	)
}