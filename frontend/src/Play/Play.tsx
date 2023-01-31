import React, { useState, useEffect } from 'react';
import Ball, { Ballpos } from './Components/Ball'
import Paddle from './Components/Paddle';
import PongField from './Components/Pongfield';
import { Header, ISafeAppState } from '../App';
import { socket } from './socket';
import { playFieldXMaxSize, playFieldYMaxSize } from '../constants';

export function Play({app_state, set_page/*, ballz*/} : {app_state: ISafeAppState, set_page: any/*, ballz: Ballpos*/}) {
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [lastPong, setLastPong] = useState("never");
	const [count, setCount] = useState(0);
	let ballz: Ballpos = { posx: playFieldXMaxSize / 2, posy: playFieldYMaxSize / 2 };
	

	useEffect(() => {
		const interval = setInterval(() => {
			setCount(count + 1);
		}, 10);
		return () => clearInterval(interval);
		}, [count]);
	//moveIt(ballz);

	useEffect(() => {
		socket.on('connect', () => {
			setIsConnected(true);
			console.log("connected")
		});

		socket.on('disconnect', () => {
			setIsConnected(false);
			console.log("disconnected")
		});

		socket.on('pong', () => {
			setLastPong(new Date().toISOString());
			console.log("answered")
		});

		return () => {
			socket.off('connect');
			socket.off('disconnect');
			socket.off('pong');
		};
	}, []);

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