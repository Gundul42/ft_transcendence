import React from 'react';

export function DisplayName({display_name, updateDisplayName} : {display_name: string, updateDisplayName: any}) {
	return (
		<div className="Inline-description">
			<p className="Description">Username</p>
			<div className="Value">
				<form action="https://localhost/api/display_name" method="post">
					<input type="text" name="uname" id="uname" value={display_name} onChange={updateDisplayName} required />
					<input type="submit" value="Change"/>
				</form>
			</div>
		</div>
	)
}