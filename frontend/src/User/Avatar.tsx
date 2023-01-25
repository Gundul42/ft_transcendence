import React from 'react';

export function Avatar({user_state, uploadAvatar} : {user_state: any, uploadAvatar: any}) {
	return (
	<div className="Avatar-container">
		<img src={"https://localhost/content/img/" + user_state.avatar} alt="Avatar" className="Avatar-base"/>
		<div className="Overlay-container">
			<img src="https://localhost/content/img/icons/pen.png" alt="Modify" className="Avatar-overlay" onClick={uploadAvatar}/>
		</div>
	</div>
	)
}