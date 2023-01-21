import React from 'react';
import './App.css';
import { Home } from './Home';
import { User } from './User';
import { Chat } from './Chat';
import { Play } from './Play';

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
      <h1 className="App-title" onClick={() => {set_page("home")}}>Meatball Massacre</h1>
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

function Dispatch({app_state, set_page} : {app_state: any, set_page: any}) {
  let to_render: any;
  if (app_state.data === null) {
    to_render = <p>*Sad backend noises*</p>;
  }
  else if (app_state.data.type === 'link') {
    to_render = <Link data={app_state.data.data} />;
  } else if (app_state.data.type === 'content') {
    switch (app_state.page) {
      case "user":
        return (<User app_state={app_state} set_page={set_page} />);
      case "chat":
        return (<Chat app_state={app_state} set_page={set_page} />);
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
  };

  goBack(event: Event) {
    window.history.back();
    this.setState({
      status: window.history.state.status,
      error: window.history.state.error,
      data: window.history.state.data,
      page: window.history.state.status,
    })
  }

  componentDidMount() {
    fetch("https://localhost/api/auth", {
      method: "GET"
    })
    .then((value) => value.json())
    .then((parsed_data) => {
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
    window.addEventListener('popstate', this.goBack);
  };

  setPage(new_page: "home" |"user" | "chat" | "play") {
    this.setState((old_state: any) => ({
      status: old_state.status,
      error: old_state.error,
      data: old_state.data,
      page: new_page
    }), () => { window.history.pushState(this.state, ""); console.log(window.history.state)})
  }

  render() {
    return (
      <div className="App">
        <Dispatch app_state={this.state} set_page={this.setPage}/>
      </div>
    );
  }
}

export default App;