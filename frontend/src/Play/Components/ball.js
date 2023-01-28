import React from 'react';
import { getAspects } from './helpers';

export type Ballpos = {
	posx: number,
	posy: number,
	velx: number,
	vely: number 
}

function Ball({ x, y }) {
	const r = 25 * getAspects().aspect;
	x *= getAspects().aspectx;
	y *= getAspects().aspecty;
	//console.log(x, y);
	return (
		<div
			style={{
				position: 'absolute',
				left: `${x}px`,
				top: `${y}px`,
				width: `${r}px`,
				height: `${r}px`,
				borderRadius: '50%',
				backgroundColor: 'red',
			}}
		/>
	);
}

export default Ball;
