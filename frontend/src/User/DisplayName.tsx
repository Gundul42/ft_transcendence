import React, { useState } from 'react';

export function DisplayName({display_name} : {display_name: string}) {
	const [name, setName] : [name: string, setName: any] = useState(display_name);
	const handleSubmit = (event: any) => {
		if (name.length > 0) {
			event.preventDefault();
			fetch("https://localhost/api/display_name", {
				method: "POST",
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'accept-encoding': 'gzip, deflate, br',
					'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string
				},
				body: encodeURIComponent("uname") + "=" + encodeURIComponent(name)
			})
			.then(
				() => { window.location.reload() },
				(err) => { console.log(err) }
			)
		}
	}
	return (
		<div className="Inline-description">
			<p className="Description">Username</p>
			<div className="Value">
				<form onSubmit={handleSubmit} >
					<input type="text" name="uname" id="uname" value={name} onChange={(event) => {setName(event.target.value)}} required />
					<input type="submit" value="Change"/>
				</form>
			</div>
		</div>
	)
}