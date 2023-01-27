import React from 'react';
import './App.css';
import { Home } from './Home/Home';
import { User } from './User/User';
import { Chat } from './Chat/Chat';
import { Play } from './Play/Play';
import { OTP } from './OTP';

export enum Status {
  Starting,
  Loading,
  Success,
  Error,
  Retrying,
}

export function Header({set_page} : {set_page: any}) {
  return (
    <header className="App-header">
      <h1 className="App-title" onClick={() => {set_page("home")}}>Mini_Pong</h1>
    </header>
  )
}

function Link({data} : {data: any}) {
  return (
    <div className="Login">
      <a href={data.link}>
        <div className="button">
          Login
        </div>
      </a>
    </div>
  )
}

function Dispatch({app_state, set_page, set_data} : {app_state: any, set_page: any, set_data: any}) {
  let to_render: any;
  if (app_state.data === null) {
    to_render = <p>*Sad backend noises*</p>;
  }
  else if (app_state.data.type === 'link') {
    to_render = <Link data={app_state.data.data} />;
  } else if (app_state.data.type === 'twoFA') {
    to_render = <OTP set_data={set_data} />;
  } else if (app_state.data.type === 'content') {
    switch (app_state.page) {
      case "user":
        return (<User app_state={app_state} set_page={set_page} />);
      case "chat":
        return (<Chat app_state={app_state} set_page={set_page}/>);
      case "play" :
        return (<Play app_state={app_state} set_page={set_page} />);
      default:
        return (<Home app_state={app_state} set_page={set_page} />);
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

class App extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      status: Status.Starting,
      error: null,
      data: null,
      page: "home",
    };

    this.setPage = this.setPage.bind(this);
    this.setData = this.setData.bind(this);
  };

  goBack(event: Event) {
    if (window.history.state !== null) {
      this.setState({
        status: window.history.state.status,
        error: window.history.state.error,
        data: window.history.state.data,
        page: window.history.state.page,
      });
    } else {
      window.location.reload();
    }
  }

  componentDidMount() {
    fetch("https://localhost/api/auth", {
      method: "GET"
    })
    .then((value) => value.json())
    .then((parsed_data) => {
      localStorage.setItem('csrf_token', parsed_data.data.csrf_token);
      if (window.history.state === null) {
        this.setState((previous_state: any) => ({
          status: Status.Success,
          error: null,
          data: parsed_data,
          page: previous_state.page
        }))
      } else {
        this.setState({
          status: Status.Success,
          error: null,
          data: parsed_data,
          page: window.history.state.page
        })
      }
    });
    window.addEventListener('popstate', this.goBack.bind(this));
  };

  setData(fetched_data: any) {
    this.setState((prev_state: any) => ({
      status: prev_state.status,
      error: prev_state.error,
      data: fetched_data,
      page: prev_state.page
    }))
  }

  setPage(new_page: "home" |"user" | "chat" | "play") {
    this.setState((prev_state: any) => ({
      status: prev_state.status,
      error: prev_state.error,
      data: prev_state.data,
      page: new_page
    }), () => { window.history.pushState(this.state, "");})
  }

  render() {
    return (
      <div className="App">
        <Dispatch app_state={this.state} set_page={this.setPage} set_data={this.setData} />
      </div>
    );
  }
}

export default App;