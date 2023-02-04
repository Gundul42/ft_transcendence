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

export interface IUserPublic {
	id:				number,
	display_name:	string,
	avatar:			string,
	status:			number
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
	winner_id:		number,
	loser_id:		number,
	winner:			IUserPublic,
	loser:			IUserPublic
}

export interface IAPICall {
	type:			string,
	link:			string | null,
	data:			IUser | null
}

export interface ICoordinate {
	x: number;
	y: number;
}

export interface IGameState {
	ball: ICoordinate,
	paddle1: {y: number},
	paddle2: {y: number}
}

export interface ILobbyState {
	player1:	IUserPublic,
	player2:	IUserPublic,
	id:			number,
	spectators:	number,
	p1_points:	number,
	p2_points:	number,
	round:		number
}

export interface IFinish {
	winner:		string,
	message:	string
}
