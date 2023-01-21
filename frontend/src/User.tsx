import React from 'react';
import { Header } from './App';

export function User({app_state, set_page} : {app_state: any, set_page: any}) {
	return (
		<div className="User">
			<Header set_page={set_page} />
			<h1>This is your personal page</h1>
		</div>
	)
}