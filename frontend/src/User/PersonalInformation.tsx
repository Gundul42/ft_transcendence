import React from 'react';
import { Avatar } from './Avatar';
import { DisplayName } from './DisplayName';
import { TwoFA } from './TwoFA';
import { ISafeAppState } from '../Interfaces';

export const PersonalInformation = ({app_state, uploadAvatar, setTwoFA} : {app_state: ISafeAppState, uploadAvatar: any, setTwoFA: any}) => {
	return (
		<div className="Left-column">
			<Avatar app_state={app_state} uploadAvatar={uploadAvatar}/>
			<div className="Text-field">
				<h2>Personal Information</h2>
				<div className="Inline-description"><p className="Description">Full Name</p><p className="Value">{app_state.data.full_name}</p></div>
				<div className="Inline-description"><p className="Description">Email</p><p className="Value">{app_state.data.email}</p></div>
				<DisplayName display_name={app_state.data.display_name} />
				<TwoFA setTwoFA={setTwoFA} twoFA={app_state.data.twoFA} />
			</div>
		</div>
	)
}

