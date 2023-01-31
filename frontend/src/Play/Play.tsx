import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Header, ISafeAppState } from '../App';

const socket = io("https://localhost/game", {'transports': ['websocket']});

export function Play({app_state, set_page} : {app_state: ISafeAppState, set_page: any}) {
	const [isConnected, setIsConnected] = useState(socket.connected);
	const [lastPong, setLastPong] = useState("never");

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

	const sendPing = () => {
		socket.emit('ping');
		console.log("sending Ping");
	  }
	return (
		<div className="Play">
			<Header set_page={set_page} />
			<p>Connected: {"" + isConnected}</p>
			<p>Last pong: {lastPong}</p>
			<button onClick={sendPing}>Send ping</button>
			<h1>Here you can play against other players</h1>
		</div>
	)
}