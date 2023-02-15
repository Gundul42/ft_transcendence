import React, { useState } from 'react';
import endpoint from '../endpoint.json'

export const DisplayNamePrompt = () => {
	const [name, setName] : [name: string, setName: any] = useState("");

	const handleSubmit = (event: any) => {
		if (name.length > 21)
		{
			alert("It's a name, not a bio, choose a name shorter than 21 characters");
		}
		else if (name.length > 0) {
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
					alert("It was not possible to set this username");
					throw new Error("It was not possible to set the username");
				}
				window.location.reload();
			})
			.catch((err: any) => {console.log(err)})
		}
	}

	return (
		<div className="Wall">
			<h1>It looks like you don't have a username yet!</h1>
			<form onSubmit={handleSubmit}>
				<label htmlFor="uname">Set a username: </label>
				<input type="text" name="uname" id="uname" placeholder="LivingLegend42" value={name} onChange={(e) => {setName(e.target.value)}} required />
				<input type="submit" value="Submit"/>
			</form>
		</div>
	)
}