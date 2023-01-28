import React from 'react';
import { IUserState } from './User';
import endpoint from '../endpoint.json'

export function Avatar({user_state, uploadAvatar} : {user_state: IUserState, uploadAvatar: any}) {
	return (
	<div className="Avatar-container">
		<img src={endpoint.content.img + "/" + user_state.avatar} alt="Avatar" className="Avatar-base"/>
		<div className="Overlay-container">
			<img src={endpoint.content.img + "/icons/pen.png"} alt="Modify" className="Avatar-overlay" onClick={uploadAvatar}/>
		</div>
	</div>
	)
}