import React from 'react';

export function TwoFA({twoFA, setTwoFA} : {twoFA: boolean, setTwoFA: any}) {
	let input_value: string;
	let input_class: string;
	if (!twoFA) {
		input_value = "Activate";
		input_class = "TwoFA-activate";
	} else {
		input_value = "Dectivate";
		input_class = "TwoFA-deactivate";
	}
	return (
		<div className="Inline-description">
			<p className="Description">2FA</p>
			<input type="button" value={input_value} className={input_class} onClick={setTwoFA}/>
		</div>
	)
}