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
	blocked:		IUserPublic[],
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

export interface IUserPublicPage extends IUserPublic {
	wins:			number,
	losses:			number,
	ladder_level:	number,
	achievements:	IAchieve[],
	match_history:	IMatch[]
}

export interface IAchieve {
	id:				number,
	name:			string,
	description:	string,
	logo:			string
}

export interface IMessage {
	value:			string,
	uname:			string,
	id:				number,
	appUserId:		number,
	room:			string
}

export interface IRoom {
	id:				number,
	participants:	IUserPublic[],
	administrators:	IUserPublic[],
	penalties:		any[],
	accessibility:	IRoomAccess,
	name:			string,
	messages:		IMessage[],
	owner:			IUserPublic
}

export interface IMatch {
	id:				string,
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

export enum IRoomAccess {
	Public,
	Private,
	PassProtected,
	DirectMessage
}

export enum IPenaltyType {
	Kick,
	Ban,
	Mute
}