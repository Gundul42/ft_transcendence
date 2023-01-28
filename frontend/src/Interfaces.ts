export enum UserStatus {
	Offline,
	Online,
	InGame
}

export interface IUser {
	full_name:		string,
	email:			string,
	display_name:	string,
	twoFA:			boolean,
	avatar:			string,
	status:			UserStatus,
	wins:			number,
	losses:			number,
	ladder_level:	number,
	friends:		IUser[],
	achievements:	IAchieve[],
	match_history:	IMatch[],
	csrf_token:		string
}

export interface IAchieve {
	id:				number,
	type:			number,
	name:			string,
	description:	string,
	logo:			string
}

export interface IMatch {
	id:				number,
	started_at:		Date,
	finished_at:	Date,
	player1:		IUser,
	player2:		IUser,
	winner:			number,
	ladder:			number
}

export interface IAPICall {
	type:			string,
	link:			string | null,
	data:			IUser | null
}