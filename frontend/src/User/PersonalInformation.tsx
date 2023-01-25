import React from 'react';
import { TwoFA } from './TwoFA';
import { Avatar } from './Avatar';
import { DisplayName } from './DisplayName';

export function PersonalInformation({user_state, full_name, email, uploadAvatar, setTwoFA, updateDisplayName} : {user_state: any, full_name: string, email: string, uploadAvatar: any, setTwoFA: any, updateDisplayName: any}) {
/*	constructor(props: any) {
		super(props);
		this.state = {
			avatar: props.app_state.data.data.avatar,
			display_name: props.app_state.data.data.display_name,
			twoFA: props.app_state.data.data.twoFA
		}
		this.updateDisplayName = this.updateDisplayName.bind(this);
		this.uploadAvatar = this.uploadAvatar.bind(this);
		this.setTwoFA = this.setTwoFA.bind(this);
	}

	uploadAvatar() {
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
					if (!newAvatar.name.endsWith(".png") && !newAvatar.name.endsWith(".jpeg") && !newAvatar.name.endsWith(".jpg")) {
						alert("Format not valid: upload either a '.png', '.jpg' or a 'jpeg'");
						return ;
					}
					let form_data: FormData = new FormData();
					form_data.append("avatar", newAvatar, newAvatar.name);
					fetch('https://localhost/content/upload', {method: "POST", body: form_data})
					.then(
						async (res) => {
							const res_json: any = await res.json(); 
							this.setState((prev_state) => ({
								avatar: res_json.new_path,
								display_name: prev_state.display_name,
								twoFA: !prev_state.twoFA
							}))
						},
						(err) => {
							console.log(err);
						})
				}
			}
		}
	}

	updateDisplayName(event: any) {
		if (event.target !== null) {
			this.setState((prev_state) => ({
				avatar: prev_state.avatar,
				display_name: event.target.value,
				twoFA: prev_state.twoFA
			}))
		}
	}

	setTwoFA() {
		fetch("https://localhost/api/twoFA")
		.then(
			async (res: Response) => {
				const data: any = await res.json();
				if (data.qr !== null) {

				}
				this.setState((prev_state) => ({
					avatar: prev_state.avatar,
					display_name: prev_state.display_name,
					twoFA: !prev_state.twoFA
				}))
			},
			(err) => {
				console.log("error:");
				console.log(err);
			}
		)
	}
*/
	return (
		<div className="Left-column">
			<Avatar user_state={user_state} uploadAvatar={uploadAvatar}/>
			<div className="Text-field">
				<h2>Personal Information</h2>
				<div className="Inline-description"><p className="Description">Full Name</p><p className="Value">{full_name}</p></div>
				<div className="Inline-description"><p className="Description">Email</p><p className="Value">{email}</p></div>
				<DisplayName display_name={user_state.display_name} updateDisplayName={updateDisplayName} />
				<TwoFA setTwoFA={setTwoFA} twoFA={user_state.twoFA} />
			</div>
		</div>
	)
}

