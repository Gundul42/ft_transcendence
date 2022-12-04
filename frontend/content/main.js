const backendAPI = "https://localhost/api/";

class oauth2 {
	constructor(client_id, redirect_uri, scope, state, response_type) {
		this.client_id = client_id;
		this.redirect_uri = redirect_uri;
		this.scope = scope;
		this.state = state;
		this.response_type = response_type;
	};
}

function main() {
	const cookie_sessionId = "ft_transcendence_sessionid=";
	const currentURL = new URL(window.location.href);
	const currentQuery = new URLSearchParams(currentURL.search);

	let sessionId = document.cookie.slice(document.cookie.indexOf(cookie_sessionId) + cookie_sessionId.length, document.cookie.indexOf(";", document.cookie.indexOf(cookie_sessionId)));
	if (currentQuery.get("code") != null && currentQuery.get("code").length > 0 && currentQuery.get("state") != null && currentQuery.get("state").length > 0) {
		console.log("Sending token request to backend");
	}
	else {
		console.log("Sending link request to backend");
		
		const params = new URLSearchParams("");
		let uriQuery = "";

		if (sessionId != null && sessionId.length > 0) {
			params.append("session_id", sessionId);
			uriQuery += "?" + params.toString();
		}
		const req = new XMLHttpRequest();
		req.open("GET", backendAPI + "auth/signup/" + uriQuery);
		req.send();
		if (req.responseType == "text") {
			document.getElementById("my_content").innerHTML = `<a href="${req.response}">Login</a>`;
		}
		else if (req.responseType == "json") {
			//dispatch
		}
		else {
			alert("Not handled");
		}
	}
}

main();