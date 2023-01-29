import React from 'react';
import { getAspects } from './helpers';

export type Ballpos = {
	posx: number,
	posy: number,
	velx: number,
	vely: number 
}

function Ball({ x, y }) {
	const rx = 15 * getAspects().aspectx;
	const ry = 15 * getAspects().aspecty;
	x *= getAspects().aspectx;
	y *= getAspects().aspecty;
	return (
		<div
			style={{
				position: 'absolute',
				left: `${x}px`,
				top: `${y}px`,
				width: `${rx}px`,
				height: `${ry}px`,
				borderRadius: '50%',
				backgroundColor: 'red',
			}}
		/>
	);
}

export default Ball;
