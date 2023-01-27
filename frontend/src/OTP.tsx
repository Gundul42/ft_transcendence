import React from 'react';

export class OTP extends React.Component<{set_data: any}, {otp: string | null }> {
	constructor(props: any) {
		super(props);
		this.state = {
			otp: null,
		}
	
		this.changeOTP = this.changeOTP.bind(this);
		this.sendOTP = this.sendOTP.bind(this);
	}

	changeOTP(event: any) {
		if (event.target !== null) {
			this.setState({ otp: event.target.value });
		}
	}

	sendOTP() {
		if (this.state.otp === null || this.state.otp === "" || (this.state.otp as string).length !== 6) {
			return ;
		}
		fetch("https://localhost/api/auth?otp=" + this.state.otp)
		.then(
			(data) => {
				this.props.set_data(data);
			},
			(err) => {
				console.log(err);
				this.props.set_data(null);
			}
		)
		.then(() => {window.location.reload()})
		.catch((err) => {console.log(err)})
	}

	render() {
		return (
			<div className="One-time-password">
				<p>Insert your 2FA here:&nbsp;</p>
				<input type="text" name="otp" placeholder="******" onChange={this.changeOTP} />
				<button onClick={this.sendOTP}>→</button>
			</div>
		)
	}
}