import React from 'react';
import { TwoFA } from './TwoFA';
import { Avatar } from './Avatar';
import { DisplayName } from './DisplayName';
import { IUserState } from './User';

export function PersonalInformation({user_state, full_name, email, uploadAvatar, setTwoFA} : {user_state: IUserState, full_name: string, email: string, uploadAvatar: any, setTwoFA: any}) {
	return (
		<div className="Left-column">
			<Avatar user_state={user_state} uploadAvatar={uploadAvatar}/>
			<div className="Text-field">
				<h2>Personal Information</h2>
				<div className="Inline-description"><p className="Description">Full Name</p><p className="Value">{full_name}</p></div>
				<div className="Inline-description"><p className="Description">Email</p><p className="Value">{email}</p></div>
				<DisplayName display_name={user_state.display_name} />
				<TwoFA setTwoFA={setTwoFA} twoFA={user_state.twoFA} />
			</div>
		</div>
	)
}

