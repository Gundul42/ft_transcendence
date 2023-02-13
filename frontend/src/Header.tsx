import React from 'react';

export const Header = ({set_page} : {set_page: any}) => {
	return (
		<header className="App-header">
			<h1 className="App-title" onClick={() => {set_page("home"); window.location.reload()}}>Mini_Pong</h1>
		</header>
	)
}