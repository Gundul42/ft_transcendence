import React, { useState, useEffect } from 'react';
import { Dashboard } from '../User/Dashboard';
import { Header } from '../Header';
import { PublicInfo } from './PublicInfo';
import { RightColumn } from '../Right_column';
import { IAppState, ISafeAppState, IUserPublicPage } from '../Interfaces';
import endpoint from '../endpoint.json';

export function Visit({ app_state, set_page, unreadRooms } : { app_state : ISafeAppState, set_page: any, unreadRooms: number }) {
	const [userStats, setUserStats] : [IUserPublicPage | null, any] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(endpoint.users.userinfo + "/" + app_state.page.visited_id.toString());
				const data: IUserPublicPage = await response.json();
				setUserStats(data);
			} catch (err) {
				console.log(err);
			}
		}
		fetchData();
	}, []);

	let converter: IAppState = {
		data: {
			type: "content",
			link: null,
			data: app_state.data
		},
		page: app_state.page
	};

	if (userStats === null) {
		return (<></>)
	}
	return (
		<div className="Visited-user">
			<PublicInfo user_info={userStats} app_state={app_state} />
			<Header set_page={set_page} />
			<Dashboard user_info={userStats} />
			<RightColumn set_page={set_page} app_state={converter} unreadRooms={unreadRooms} />
		</div>
	)
}