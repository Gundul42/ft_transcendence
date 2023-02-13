import React from 'react';
import endpoint from '../endpoint.json'
import { ISafeAppState } from '../Interfaces';

export const Avatar = ({app_state, uploadAvatar} : {app_state: ISafeAppState, uploadAvatar: any}) => {
	return (
	<div className="Avatar-container">
		<img src={endpoint.content.img + "/" + app_state.data.avatar} alt="Avatar" className="Avatar-base"/>
		<div className="Overlay-container">
			<img src={endpoint.content.img + "/icons/pen.png"} alt="Modify" className="Avatar-overlay" onClick={uploadAvatar}/>
		</div>
	</div>
	)
}