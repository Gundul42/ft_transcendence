import React from 'react';

export const QR = ({ qr_link, closeQR } : { qr_link: string, closeQR: any }) => {
	return(
		<div className="Wall">
			<h1>Scan this QR code with the app Google Authenticator or equivalent</h1>
			<img src={qr_link} alt="QR code" className="QRcode"/>
			<input type="button" className="button" onClick={closeQR} value="Close" />
		</div>
	)
}