export enum ClientEvents {
	Play = "Play",
	Watch = "Watch",
	Leave = "Leave",
	Cancel = "Cancel",
	Up = "Up",
	Down = "Down",
	Stop = "Stop",
	Invite = "Invite",
	AcceptInvitation = "AcceptInvitation"
}

export enum ServerEvents {
	GlobalState = "GlobalState",
	GameState = "GameState",
	LobbyState = "LobbyState",
	Refuse = "Refuse",
	Finish = "Finish",
	Ready = "Ready",
	ForwardInvitation = "ForwardInvitation",
	ForwardDecline = "ForwardDecline"
}