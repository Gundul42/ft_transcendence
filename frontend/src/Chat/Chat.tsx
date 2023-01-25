import React from 'react';
import { Header } from '../App';

export function Chat({app_state, set_page} : {app_state: any, set_page: any}) {
	return (
		<div className="Chat">
			<Header set_page={set_page} />
			<h1>Here you can chat with other users</h1>
		</div>
	)
}