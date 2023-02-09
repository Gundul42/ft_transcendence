import React, { useState, useEffect } from 'react';
import endpoint from '../endpoint.json';
import { IUserPublic } from '../Interfaces';

export const SearchBar = ({set_page} : {set_page: any}) => {
	const [textField, setTextField] : [string, any] = useState("");
	const [foundUsers, setFoundUsers] : [IUserPublic[], any] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(endpoint.users['search-all'] + "?start=" + encodeURIComponent(textField));
				const data: IUserPublic[] = await response.json();
				setFoundUsers(data);
			} catch (err) {
				console.log(err);
			}
		}
		if (textField.length > 0) {
			fetchData();
		} else {
			setFoundUsers([])
		}
	}, [textField])

	return (
		<div>
			<input style={{backgroundColor: "white", borderRadius: "30px", border: "1px solid black", height: "30px", width: "95%"}} type="text" placeholder="Search..." value={textField} onChange={(event: React.FormEvent<HTMLInputElement>) => {setTextField((event.target as HTMLInputElement).value)}}/>
			<table className="Search-bar">
				<tbody>
				{ foundUsers.length > 0 &&
					foundUsers.map((user) => {
						return (
							<tr key={user.id}>
								<td>{user.display_name}</td>
								<td>
									<button onClick={()=>{set_page("visit", user.id)}}>&#x1f464;</button>
									<button onClick={()=>{console.log("direct message")}}>&#128172;</button>
								</td>
							</tr>
						)
					}) }
				</tbody>
			</table>
		</div>
	)
}