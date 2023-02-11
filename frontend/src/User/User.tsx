import React from 'react';
import { Header, IAppState, ISafeAppState } from '../App';
import { RightColumn } from '../Right_column';
import { PersonalInformation } from './PersonalInformation';
import { QR } from './QR';
import { Dashboard } from './Dashboard';
import endpoint from '../endpoint.json';
import { IUserPublicPage } from '../Interfaces';

export interface IUserState {
	avatar: string,
	display_name: string,
	twoFA: boolean,
	qr: any
}

export class User extends React.Component <{ app_state: ISafeAppState, set_page: any, unreadRooms: number}, IUserState> {
	constructor(props: { app_state: ISafeAppState, set_page: any, unreadRooms: number}) {
		super(props);
		this.state = {
			avatar: props.app_state.data.avatar,
			display_name: props.app_state.data.display_name,
			twoFA: props.app_state.data.twoFA,
			qr: null
		}

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
					.then(
						async (res) => {
							const res_json: any = await res.json(); 
							this.setState((prev_state: IUserState) => ({
								avatar: res_json.new_path,
								display_name: prev_state.display_name,
								twoFA: prev_state.twoFA,
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

	setTwoFA() {
		let form_data: FormData = new FormData();
		fetch(endpoint.auth.twoFA, {
			method: "POST",
			body: form_data,
			headers: { 'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string }
		})
		.then(
			async (res: Response) => {
				const data: any = await res.json();
				this.setState((prev_state: IUserState) => ({
					avatar: prev_state.avatar,
					display_name: prev_state.display_name,
					twoFA: !prev_state.twoFA,
					qr: data.qr
				}));
			},
			(err) => {
				console.log("error:");
				console.log(err);
			}
		)
	}

	closeQR() {
		this.setState((prev_state: IUserState) => ({
			avatar: prev_state.avatar,
			display_name: prev_state.display_name,
			twoFA: prev_state.twoFA,
			qr: null
		}), () => window.location.reload());
	}

	render() {
		let converter: IAppState = {
			data: {
				type: "content",
				link: null,
				data: this.props.app_state.data
			},
			page: this.props.app_state.page
		}
		let user_info: IUserPublicPage = {
			id: this.props.app_state.data.id,
			display_name: this.props.app_state.data.display_name,
			avatar: this.props.app_state.data.avatar,
			status: this.props.app_state.data.status,
			wins: this.props.app_state.data.wins,
			losses: this.props.app_state.data.losses,
			ladder_level: this.props.app_state.data.ladder_level,
			match_history: this.props.app_state.data.match_history,
			achievements: this.props.app_state.data.achievements,
		}
		return (
			<div className="User">
				{ this.state.qr !== null &&
				<QR qr_link={this.state.qr} closeQR={this.closeQR}/>}
				<PersonalInformation user_state={this.state} full_name={this.props.app_state.data.full_name} email={this.props.app_state.data.email} uploadAvatar={this.uploadAvatar} setTwoFA={this.setTwoFA} />
				<Header set_page={this.props.set_page} />
				<Dashboard user_info={user_info} />
				<RightColumn app_state={converter} set_page={this.props.set_page} unreadRooms={this.props.unreadRooms} />
			</div>
		)
	}
}