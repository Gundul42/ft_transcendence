import React, { useState } from 'react';
import endpoint from './endpoint.json'

export const OTP = ({set_data} : {set_data: any}) => {
	const [otp, setOtp] : [string, any] = useState("");

	const sendOTP = () => {
		if (otp === "" || otp.length !== 6) {
			return ;
		}
		fetch(endpoint.auth.login + "?otp=" + otp)
		.then(
			(data) => {
				set_data(data);
			},
			(err) => {
				console.log(err);
				set_data(null);
			}
		)
		.then(() => {window.location.reload()})
		.catch((err) => {console.log(err)})
	}

	return (
		<div className="One-time-password">
			<p>Insert your 2FA here:&nbsp;</p>
			<input type="text" name="otp" value={otp} placeholder="******" onChange={(e: React.FormEvent<HTMLInputElement>) => {setOtp((e.target as HTMLInputElement).value)}} />
			<button onClick={sendOTP}>→</button>
		</div>
	)
}