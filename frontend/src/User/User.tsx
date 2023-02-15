import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { Header } from '../Header';
import { PersonalInformation } from './PersonalInformation';
import { QR } from './QR';
import { RightColumn } from '../Right_column';
import { IUserPublicPage, ISafeAppState, IAPICall, IUser } from '../Interfaces';
import endpoint from '../endpoint.json';
import './User.css';

export const User = (
	{ app_state, set_page, unreadMessages, set_data} : 
	{ app_state: ISafeAppState, set_page: any, unreadMessages: number, set_data: any}
	) => {
	const [qr, setQr] : [string, any] = useState("")

	const uploadAvatar = () => {
		var input: HTMLInputElement = document.createElement('input');
		input.type = "file";
		input.name = "avatar";
		input.click();

		var newAvatar: File;
		input.onchange = (e: Event) => {
			if (e.target !== null) {
				let files = (e.target as HTMLInputElement).files;
				if (files !== null) {
					newAvatar = files[0];
					if (!newAvatar.name.toLowerCase().endsWith(".png") && !newAvatar.name.toLowerCase().endsWith(".jpeg") && !newAvatar.name.toLowerCase().endsWith(".jpg") && !newAvatar.name.toLowerCase().endsWith(".gif")) {
						alert("Format not valid: upload either a '.png', '.jpg' or a 'jpeg'");
						return ;
					}
					let form_data: FormData = new FormData();
					form_data.append("avatar", newAvatar, newAvatar.name);
					fetch(endpoint.content.upload, {
						method: "POST",
						body: form_data,
						headers: { 'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
					})
					.then( async (res) => {
						if (!res.ok) {
							alert("Avatar could not be changed, make sure it's less than 5MB and in correct format");
						}
						const res_json: any = await res.json();
						set_data((prev_data: IAPICall) => {
							if (prev_data.type === "content" && prev_data.data !== null) {
								const safe_data: IUser = (prev_data.data as IUser)
								return (
									{
										...prev_data,
										data: {
											...safe_data,
											avatar: res_json.new_path
										}
									}
								)
							} else {
								return (prev_data);
							}
						})
					})
					.catch((err: any) => console.log(err))
				}
			}
		}
	}

	const setTwoFA = () => {
		let form_data: FormData = new FormData();
		fetch(endpoint.auth.twoFA, {
			method: "POST",
			body: form_data,
			headers: { 'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
		.then( async (res: Response) => {
			if (!res.ok) {
				throw new Error("Could not set Two Factor Authentication");
			}
			const res_json: any = await res.json();
			set_data((prev_data: IAPICall) => {
				if (prev_data.type === "content" && prev_data.data !== null) {
					const safe_data: IUser = (prev_data.data as IUser)
					return (
						{
							...prev_data,
							data: {
								...safe_data,
								twoFA: !safe_data.twoFA
							}
						}
					)
				} else {
					return (prev_data);
				}
			});
			setQr(res_json.qr);
		})
		.catch((err: any) => console.log(err))
	}

	const user_info: IUserPublicPage = {
		id: app_state.data.id,
		display_name: app_state.data.display_name,
		avatar: app_state.data.avatar,
		status: app_state.data.status,
		wins: app_state.data.wins,
		losses: app_state.data.losses,
		ladder_level: app_state.data.ladder_level,
		match_history: app_state.data.match_history,
		achievements: app_state.data.achievements
	};

	return (
		<div className="User">
			{ qr.length > 0 &&
			<QR qr_link={qr} closeQR={() => {setQr("")}}/>}
			<PersonalInformation app_state={app_state} uploadAvatar={uploadAvatar} setTwoFA={setTwoFA} />
			<Header set_page={set_page} />
			<Dashboard user_info={user_info} />
			<RightColumn set_page={set_page} unreadMessages={unreadMessages} />
		</div>
	)
}