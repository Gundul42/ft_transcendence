import React from 'react';
import { Header } from '../App';
import { RightColumn } from '../Right_column';
import { PersonalInformation } from './PersonalInformation';
import { QR } from './QR';

export class User extends React.Component <{ app_state: any, set_page: any}, { avatar: string, display_name: string, twoFA: boolean, qr: any }> {
	constructor(props: any) {
		super(props);
		this.state = {
			avatar: props.app_state.data.data.avatar,
			display_name: props.app_state.data.data.display_name,
			twoFA: props.app_state.data.data.twoFA,
			qr: null
		}
		this.updateDisplayName = this.updateDisplayName.bind(this);
		this.uploadAvatar = this.uploadAvatar.bind(this);
		this.setTwoFA = this.setTwoFA.bind(this);
		this.closeQR = this.closeQR.bind(this);
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
								twoFA: !prev_state.twoFA,
								qr: null
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
				twoFA: prev_state.twoFA,
				qr: null
			}))
		}
	}

	setTwoFA() {
		fetch("https://localhost/api/twoFA")
		.then(
			async (res: Response) => {
				const data: any = await res.json();
				this.setState((prev_state) => ({
					avatar: prev_state.avatar,
					display_name: prev_state.display_name,
					twoFA: !prev_state.twoFA,
					qr: data.qr
				}))
			},
			(err) => {
				console.log("error:");
				console.log(err);
			}
		)
	}

	closeQR() {
		this.setState((prev_state) => ({
			avatar: prev_state.avatar,
			display_name: prev_state.display_name,
			twoFA: prev_state.twoFA,
			qr: null
		}))
	}

	render() {
		return (
			<div className="User">
				{ this.state.qr !== null &&
				<QR qr_link={this.state.qr} closeQR={this.closeQR}/>}
				<PersonalInformation user_state={this.state} full_name={this.props.app_state.data.data.full_name} email={this.props.app_state.data.data.email} uploadAvatar={this.uploadAvatar} setTwoFA={this.setTwoFA} updateDisplayName={this.updateDisplayName} />
				<Header set_page={this.props.set_page} />
				<p>This is your personal page</p>
				<RightColumn app_state={this.props.app_state} set_page={this.props.set_page} />
			</div>
		)
	}
}