import React, { useState, useEffect } from 'react';
import './App.css';
import { IAPICall, IPage, IUser, IChallengeInvite } from './Interfaces';
import { Home } from './Home/Home';
import { User } from './User/User';
import { Chat } from './Chat/Chat';
import { Play } from './Play/Play';
import { OTP } from './OTP';
import endpoint from './endpoint.json';
import { Visit } from './Visit/Visit';
import { socket as game_socket } from './Play/socket';
import { ServerEvents, ClientEvents } from './events';
import { ChallengeWall } from './ChallengeWall';

export enum Status {
  Starting,
  Loading,
  Success,
  Error,
  Retrying,
}

export interface IAppState {
  data: IAPICall | null,
  page: IPage
}

export interface ISafeAppState {
  data: IUser,
  page: IPage
}

export function Header({set_page} : {set_page: any}) {
  return (
    <header className="App-header">
      <h1 className="App-title" onClick={() => {set_page("home")}}>Mini_Pong</h1>
    </header>
  )
}

function Link({link} : {link: string}) {
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

function Dispatch({app_state, set_page, set_data} : {app_state: IAppState, set_page: any, set_data: any}) {
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
        return (<User app_state={safe_app_state} set_page={set_page} />);
      case "chat":
        return (<Chat app_state={safe_app_state} set_page={set_page} />);
      case "play" :
        return (<Play app_state={safe_app_state} set_page={set_page} />);
      case "visit" :
        return (<Visit app_state={safe_app_state} set_page={set_page} />)
      default:
        return (<Home app_state={safe_app_state} set_page={set_page} />);
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

// class App extends React.Component<{}, IAppState> {
//   constructor(props: {}) {
//     super(props);
//     this.state = {
//       status: Status.Starting,
//       data: null,
//       page: {
//         location: "home",
//         visited_id: 0
//       },
//     };

//     this.setPage = this.setPage.bind(this);
//     this.setData = this.setData.bind(this);
//   };

//   goBack(event: Event) {
//     if (window.history.state !== null) {
//       this.setState({
//         status: window.history.state.status,
//         data: window.history.state.data,
//         page: window.history.state.page,
//       });
//     } else {
//       window.location.reload();
//     }
//   }

//   componentDidMount() {
//     fetch(endpoint.auth.login, {
//       method: "GET"
//     })
//     .then((value) => value.json())
//     .then((parsed_data: IAPICall) => {
//       if (parsed_data.data !== null) {
//         localStorage.setItem('csrf_token', parsed_data.data.csrf_token);
//       }
//       if (window.history.state === null) {
//         this.setState((previous_state: IAppState) => ({
//           status: Status.Success,
//           data: parsed_data,
//           page: previous_state.page
//         }))
//       } else {
//         this.setState({
//           status: Status.Success,
//           data: parsed_data,
//           page: window.history.state.page
//         })
//       }
//     });
//     window.addEventListener('popstate', this.goBack.bind(this));
//   };

//   setData(fetched_data: IAPICall) {
//     this.setState((prev_state: IAppState) => ({
//       status: prev_state.status,
//       data: fetched_data,
//       page: prev_state.page
//     }))
//   }

//   setPage(new_location: "home" |"user" | "chat" | "play", visited_id: number = 0) {
//     this.setState((prev_state: IAppState) => ({
//       status: prev_state.status,
//       data: prev_state.data,
//       page: {
//         location: new_location,
//         visited_id: visited_id
//       }
//     }), () => {
//       if (this.state.page.location !== "play") {
//         window.history.pushState(this.state, "");
//       }
//     })
//   }

//   render() {
//     return (
//       <div className="App">
//         <Dispatch app_state={this.state} set_page={this.setPage} set_data={this.setData} />
//       </div>
//     );
//   }
// }


const App = () => {
  const [data, setData] : [IAPICall | null, any] = useState(null);
  const [page, setPage] : [IPage, any] = useState({location: "home", visited_id: 0});
  const [invites, setInvites] : [IChallengeInvite[], any] = useState([]);

	useEffect(() => {
		game_socket.on(ServerEvents.ForwardInvitation, (data: IChallengeInvite) => {
      console.log(data)
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
    //event.preventDefault()
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
    }
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
      <Dispatch app_state={{data: data, page: page}} set_page={doSetPage} set_data={setData} />
    </div>
  )
}


export default App;