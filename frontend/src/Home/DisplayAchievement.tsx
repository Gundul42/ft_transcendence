import React from 'react';
import { IAchieve } from '../Interfaces';
import endpoint from '../endpoint.json'

export const DisplayAchievement = ({achievement} : {achievement: IAchieve}) => {
	const handleClick = () => {
		fetch(endpoint.achievement.aknowledge + "/" + achievement.id.toString(), {
			method: "POST",
			headers: {
				'content-type': 'application/x-www-form-urlencoded',
				'accept-encoding': 'gzip, deflate, br',
				'Authorization': 'Bearer ' + localStorage.getItem("csrf_token") as string
			},
		})
		.then((res) => {
			if (!res.ok) {
				throw new Error("It was not possible to aknowledge the achievement");
			}
			window.location.reload();
		})
	};

	return(
		<div className="Wall">
			<h1>{achievement.name}</h1>
			<img src={endpoint.content.img + achievement.logo} alt={achievement.logo} style={{height: "20%", aspectRatio: "1 / 1", borderRadius: "50%", border: "5px solid black"}} />
			<p>{achievement.description}</p>
			<button className="button" onClick={handleClick}>Nice</button>
		</div>
	)
}