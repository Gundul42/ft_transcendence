import React from 'react';
import './App.css';

export function Home({data} : {data: any}) {
	return(
		<div className="Home">
			<h1>Welcome {(data.full_name as string).split(' ')[0]}</h1>
			<button className="button" type="submit" formMethod="get" formAction="https://localhost/play/matchmaking">
				Play
			</button>
		</div>
	)
}
