import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChallengeWall } from './ChallengeWall';
import { Chat } from './Chat/Chat';
import { Header } from './Header';
import { Home } from './Home/Home';
import { OTP } from './OTP';
import { Play } from './Play/Play';
import { User } from './User/User';
import { Visit } from './Visit/Visit';
import { ServerEvents, ClientEvents } from './events';
import { IAPICall, IPage, IAppState, ISafeAppState, IChallengeInvite, IUser, IUserPublic, IRoom, IMessage } from './Interfaces';
import endpoint from './endpoint.json';
import './App.css';

const Link = ({link} : {link: string}) => {
	return (
		<div className="Login">
			<a href={link}>
				<div className="button">
				Login
				</div>
			</a>
		</div>
	)
}

const Dispatch = (
	{app_state, set_page, set_data, unreadMessages, setUnreadMessages, chat_socket, game_socket, rooms, messages} : 
	{app_state: IAppState, set_page: any, set_data: any, unreadMessages: number, setUnreadMessages: any, chat_socket: Socket | null, game_socket: Socket | null, rooms: Map<string, IRoom>, messages: Map<string, IMessage[]>}
	) => {
	let to_render: any;

	if (app_state.data === null) {
		to_render = <p>*Sad backend noises*</p>;
	}
	else if (app_state.data.type === 'link' && app_state.data.link !== null) {
		to_render = <Link link={app_state.data.link} />;
	} else if (app_state.data.type === 'twoFA') {
		to_render = <OTP set_data={set_data} />;
	} else if (app_state.data !== null && app_state.data.data !== null && app_state.data.type === 'content' && chat_socket !== null && game_socket !== null) {
		let safe_app_state: ISafeAppState = {
			data: app_state.data.data,
			page: app_state.page
		}
		switch (app_state.page.location) {
		case "user":
			return (<User app_state={safe_app_state} set_page={set_page} unreadMessages={unreadMessages} set_data={set_data} />);
		case "chat":
			return (<Chat app_state={safe_app_state} set_page={set_page} setUnreadMessages={setUnreadMessages} chat_socket={chat_socket as Socket} game_socket={game_socket as Socket} rooms={rooms} messages={messages} />);
		case "play" :
			return (<Play app_state={safe_app_state} set_page={set_page} game_socket={game_socket as Socket} />);
		case "visit" :
			return (<Visit app_state={safe_app_state} set_page={set_page} unreadMessages={unreadMessages} />)
		default:
			return (<Home app_state={safe_app_state} set_page={set_page} unreadMessages={unreadMessages} game_socket={game_socket as Socket} />);
		}
	} else {
		to_render = <p>Something went wrong</p>;
	}
	return (
		<div className="Open-layout">
			<Header set_page={set_page}/>
			{to_render}
			<div className="break"></div>
		</div>
	);
}

const App = () => {
	const [data, setData] : [IAPICall | null, any] = useState(null);
	const [page, setPage] : [IPage, any] = useState({location: "home", visited_id: 0});
	const [invites, setInvites] : [IChallengeInvite[], any] = useState([]);
	const [unreadMessages, setUnreadMessages] : [number, any] = useState(0);
	const [rooms, setRooms] : [Map<string, IRoom>, any] = useState(new Map<string, IRoom>());
	const [messages, setMessages] : [Map<string, IMessage[]>, any] = useState(new Map(Array.from(rooms, (room) => [room[1].name ,room[1].messages])));
	const [gameSocket, setGameSocket] : [Socket | null, any] = useState(null);
	const [chatSocket, setChatSocket] : [Socket | null, any] = useState(null);

	const goBack = (event: Event) => {
		if (window.history.state !== null && window.history.state.page !== "play") {
			setData(window.history.state.data);
			setPage(window.history.state.page);
		} else {
			window.location.reload();
		}
	};

	const doSetPage = (new_location: "home" |"user" | "chat" | "play", visited_id: number = 0) => {
		setPage({ location: new_location, visited_id: visited_id });
		if (new_location !== "play" && data !== null) {
			window.history.pushState({ data: data, page: { location: new_location, visited_id: visited_id} }, "");
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(endpoint.auth.login);
				const parsed_data: IAPICall = await response.json();
				if (parsed_data.data !== null) {
					localStorage.setItem('csrf_token', parsed_data.data.csrf_token);
					setChatSocket((prev_socket: Socket | null) => {
						if (prev_socket === null) {
							return (
								io("http://localhost/chat", {
									'transports': ['polling', 'websocket'],
									extraHeaders: {
										'Authorization': "Bearer " + localStorage.getItem("csrf_token") as string
									}
								})
							)
						} else {
							return prev_socket;
						}
					});
					setGameSocket((prev_socket: Socket | null) => {
						if (prev_socket === null) {
							return (
								io("http://localhost/game", {
									'transports': ['polling', 'websocket'],
									extraHeaders: {
										'Authorization': "Bearer " + localStorage.getItem("csrf_token") as string
									}
								})
							)
						} else {
							return prev_socket;
						}
					});
				}
				setData(parsed_data);
				if (window.history.state !== null) {
					setPage(window.history.state.page)
				}
			} catch (err) {
				console.log(err);
			}
		};
		fetchData();
	}, [])

	useEffect(() => {
		if (gameSocket === null) return ;
		const game_socket: Socket = gameSocket as Socket;
		game_socket.on(ServerEvents.ForwardInvitation, (data: IChallengeInvite) => {
			console.log("getting invite");
			if (invites.length === 0) {
				setInvites([data]);
			} else {
				game_socket.emit(ClientEvents.RespondInvitation, { lobbyId: data.lobbyId, accept: false });
			}
		});
		game_socket.on(ServerEvents.AbortInvite, () => {
			setInvites([]);
		})

		return () => {
			game_socket.off(ServerEvents.ForwardInvitation);
			game_socket.off(ServerEvents.AbortInvite);
		}
	}, [gameSocket]);

	useEffect(() => {
		window.addEventListener('popstate', goBack);

		return () => {
			window.removeEventListener('popstate', goBack);
		}
	}, [page])

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(endpoint.chat.retrieve);
				const data: IRoom[] = await response.json();
				setRooms(new Map(data.map((room) => [room.name, room])));
				data.forEach((room) => {
					window.localStorage.setItem(room.name, room.messages.length.toString());
				})
			} catch (err) {
				console.log(err);
			}
		}
		if (data !== null && (data as IAPICall).data !== null) {
			fetchData();
		}
	}, [chatSocket])

	useEffect(() => {
		setMessages(new Map(Array.from(rooms, (room) => [room[1].name ,room[1].messages])));
	}, [rooms])

	useEffect(() => {
		if (chatSocket === null) return ;
		const chat_socket: Socket = chatSocket as Socket;
		const eventListener = (event: any, ...args: any) => {
			console.log(event, args)
		}

		chat_socket.onAny(eventListener);
		chat_socket.on("roomUpdate", ( data: {room: IRoom}) => {
			setRooms((prev_rooms: Map<string, IRoom>) => new Map(prev_rooms.set(data.room.name, data.room)));
		})
		chat_socket.on("messageResponse", (message: IMessage) =>
		{
			if (data === null || (data as IAPICall).data === null) return;
			const blocked: IUserPublic[] = (((data as IAPICall).data as IUser).blocked as IUserPublic[]);
			const blockedMap: Map<number, IUserPublic> = new Map(blocked.map((user) => [user.id, user]));
			if (blockedMap.get(message.appUserId) !== undefined) return;
			console.log("just received ", message)
			setMessages((prev_messages: Map<string, IMessage[]>) => {
				let safe_messages: IMessage[];
				if (prev_messages.get(message.room) === undefined) {
					safe_messages = [];
				} else {
					safe_messages = prev_messages.get(message.room) as IMessage[];
				}
				console.log(safe_messages)
				return new Map(messages.set(message.room, [...safe_messages, message]));
			});
			setUnreadMessages((prev_messages: number) => prev_messages + 1);
		});

		return () => {
			chat_socket.offAny(eventListener);
			chat_socket.off("roomUpdate");
			chat_socket.off('messageResponse');
		}
	}, [chatSocket])

	return (
		<div className="App">
			{ invites.length > 0 && gameSocket !== null &&
				<ChallengeWall invites={invites} setInvites={setInvites} set_page={doSetPage} game_socket={gameSocket as Socket} />}
			<Dispatch app_state={{data: data, page: page}} set_page={doSetPage} set_data={setData} unreadMessages={unreadMessages} setUnreadMessages={setUnreadMessages} chat_socket={chatSocket} game_socket={gameSocket} rooms={rooms} messages={messages} />
		</div>
	)
}

export default App;