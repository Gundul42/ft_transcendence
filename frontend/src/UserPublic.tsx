import React from 'react';
import { IUserPublic } from './Interfaces';
import endpoint from './endpoint.json';

export function UserPublic({user_info, display_status, display_img} : {user_info: IUserPublic, display_img: boolean, display_status: boolean}) {
	return (
		<div className="User-public">
			{display_img &&
				<img src={endpoint.content.img + "/" + user_info.avatar} alt="pic" />}
			<p style={{padding: "5px"}}>{user_info.display_name}</p>
			{display_status &&
				<div className={"circle" + user_info.status.toString()}></div>}
		</div>
	)
}