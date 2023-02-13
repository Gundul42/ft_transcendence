import React, { useState } from 'react';
import endpoint from '../endpoint.json';

export const DisplayName = ({display_name} : {display_name: string}) => {
	const [name, setName] : [name: string, setName: any] = useState(display_name);

	const handleSubmit = (event: React.SyntheticEvent) => {
		if (name.length > 0) {
			event.preventDefault();
			fetch(endpoint.content.display_name, {
				method: "POST",
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'accept-encoding': 'gzip, deflate, br',
					'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string
				},
				body: encodeURIComponent("uname") + "=" + encodeURIComponent(name)
			})
			.then((res) => {
				if (!res.ok) {
					throw new Error("It was not possible to change name");
				}
				window.location.reload();
			})
			.catch((err: any) => {console.log(err)})
		}
	}

	return (
		<div className="Inline-description">
			<p className="Description">Username</p>
			<div className="Value">
				<form onSubmit={handleSubmit} >
					<input type="text" name="uname" id="uname" value={name} onChange={(event: React.FormEvent<HTMLInputElement>) => {setName((event.target as HTMLInputElement).value)}} required />
					<input type="submit" value="Change"/>
				</form>
			</div>
		</div>
	)
}