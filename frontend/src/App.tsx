import React, { useState, useEffect } from 'react';
import { ChallengeWall } from './ChallengeWall';
import { Chat } from './Chat/Chat';
import { Header } from './Header';
import { Home } from './Home/Home';
import { OTP } from './OTP';
import { Play } from './Play/Play';
import { User } from './User/User';
import { Visit } from './Visit/Visit';
import { socket as game_socket } from './Play/socket';
import { ServerEvents, ClientEvents } from './events';
import { IAPICall, IPage, IAppState, ISafeAppState, IChallengeInvite } from './Interfaces';
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
	{app_state, set_page, set_data, unreadRooms, setUnreadRooms} : 
	{app_state: IAppState, set_page: any, set_data: any, unreadRooms: number, setUnreadRooms: any}
	) => {
	let to_render: any;

	if (app_state.data === null) {
		to_render = <p>*Sad backend noises*</p>;
	}
	else if (app_state.data.type === 'link' && app_state.data.link !== null) {
		to_render = <Link link={app_state.data.link} />;
	} else if (app_state.data.type === 'twoFA') {
		to_render = <OTP set_data={set_data} />;
	} else if (app_state.data !== null && app_state.data.data !== null && app_state.data.type === 'content') {
		let safe_app_state: ISafeAppState = {
			data: app_state.data.data,
			page: app_state.page
		}
		switch (app_state.page.location) {
		case "user":
			return (<User app_state={safe_app_state} set_page={set_page} unreadRooms={unreadRooms} set_data={set_data} />);
		case "chat":
			return (<Chat app_state={safe_app_state} set_page={set_page} setUnreadRooms={setUnreadRooms} />);
		case "play" :
			return (<Play app_state={safe_app_state} set_page={set_page} />);
		case "visit" :
			return (<Visit app_state={safe_app_state} set_page={set_page} unreadRooms={unreadRooms} />)
		default:
			return (<Home app_state={safe_app_state} set_page={set_page} unreadRooms={unreadRooms}/>);
		}
	} else {
		to_render = <p>Something went wrong</p>;
	}
	return (
		<div className="Open-layout">
			<Header set_page={set_page}/>
			{to_render}
		</div>
	);
}

const App = () => {
	const [data, setData] : [IAPICall | null, any] = useState(null);
	const [page, setPage] : [IPage, any] = useState({location: "home", visited_id: 0});
	const [invites, setInvites] : [IChallengeInvite[], any] = useState([]);
	const [unreadRooms, setUnreadRooms] : [number, any] = useState(0);

	useEffect(() => {
		game_socket.on(ServerEvents.ForwardInvitation, (data: IChallengeInvite) => {
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
	}, [invites]);

	const goBack = (event: Event) => {
		if (window.history.state !== null && window.history.state.page !== "play") {
			setData(window.history.state.data);
			setPage(window.history.state.page);
		} else {
			window.location.reload();
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(endpoint.auth.login);
				const parsed_data: IAPICall = await response.json();
				if (parsed_data.data !== null) {
					localStorage.setItem('csrf_token', parsed_data.data.csrf_token);
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
		window.addEventListener('popstate', goBack);

		return () => {
			window.removeEventListener('popstate', goBack);
		}
	}, [page])

	const doSetPage = (new_location: "home" |"user" | "chat" | "play", visited_id: number = 0) => {
		setPage({ location: new_location, visited_id: visited_id });
		if (new_location !== "play" && data !== null) {
			window.history.pushState({ data: data, page: { location: new_location, visited_id: visited_id} }, "");
		}
	}

	return (
		<div className="App">
			{ invites.length > 0 &&
				<ChallengeWall invites={invites} setInvites={setInvites} set_page={doSetPage} />}
			<Dispatch app_state={{data: data, page: page}} set_page={doSetPage} set_data={setData} unreadRooms={unreadRooms} setUnreadRooms={setUnreadRooms} />
		</div>
	)
}

export default App;