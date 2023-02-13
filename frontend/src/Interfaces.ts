export enum UserStatus {
	Offline,
	Online,
	InGame
}

export interface IAppState {
	data: IAPICall | null,
	page: IPage
  }
  
  export interface ISafeAppState {
	data: IUser,
	page: IPage
  }

export interface IUser {
	id:				number,
	full_name:		string,
	email:			string,
	display_name:	string,
	twoFA:			boolean,
	avatar:			string,
	status:			UserStatus,
	wins:			number,
	losses:			number,
	ladder_level:	number,
	friends:		IUserPublic[],
	blocked:		IUserPublic[],
	achievements:	IAchieve[],
	match_history:	IMatch[],
	csrf_token:		string,
	requests_sent:	IUserRequest[],
	requests_rec:	(IUserRequest & {from: {display_name: string}})[]
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
	logo:			string,
	aknowledged:	boolean
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

export interface IPage {
	location:		"home" | "play" | "chat" | "visit" | "user",
	visited_id:		number
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

export interface IUserRequest {
	id:				number,
	sender_id:		number,
	receiver_id:	number,
	type:			string
}

export interface IcurrentMatch {
	id:				string,
	player1:		IUserPublic,
	player2:		IUserPublic
}

export interface IChallengeInvite {
	player1:		IUserPublic,
	lobbyId:		string
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

export enum IRoomAccess {
	Public,
	Private,
	PassProtected,
	DirectMessage
}