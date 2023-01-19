import React, { useState, useEffect } from 'react';
import './App.css';
import { Home } from './Home';
import { LeftColumn } from './Left_column';
import { RightColumn } from './Right_column';

export enum Status {
  Starting,
  Loading,
  Success,
  Error,
  Retrying,
}

interface IApi {
  status: Status,
  error: any,
  data: any,
}

function DisplayNamePrompt() {
  return(
    <div className="Display-name-prompt">
      <h1>It looks like you don't have a username yet!</h1>
      <form action="https://localhost/api/display_name" method="post">
        <label htmlFor="uname">Set a username: </label>
        <input type="text" name="uname" id="uname" placeholder="LivingLegend42"/>
        <input type="submit" value="Submit"/>
      </form>
    </div>
  )
}

function Link({data} : {data: any}) {
  return (
    <a href={data.link}>
      <div className="button">
        Login
      </div>
    </a>
  )
}

function Dispatch({result} : {result: any}) {
  console.log(result);
  if (result.data === null) {
    return (<p>*Sad backend noises*</p>);
  }
  console.log(result.data)
  if (result.data.type === 'link') {
    return (<Link data={result.data.data} />);
  } else if (result.data.type === 'content') {
    return (<Home data={result.data.data} />);
  } else {
    return (<p>Something went wrong</p>)
  }
}

function App() {
  const [result, setResult] = useState<IApi>({
    status: Status.Starting,
    error: null,
    data: null,
  });
  useEffect(() => {
    const api = () => {
      setResult({
        status: Status.Loading,
        error: null,
        data: null,
      })
      fetch("https://localhost/api/auth", {
        method: "GET"
      })
      .then(
        async (value) => {
          if (value.ok) {
            console.log(value);
            setResult({
              status: Status.Success,
              error: null,
              data: await value.json(),
            })
          }
          else {
            setResult({
              status: Status.Error,
              error: null,
              data: null,
            })
          }
        },
        (error) => {
          console.log(error);
          setResult({
            status: Status.Error,
            error: error,
            data: null,
          })
        }
      )
    };
    if (result.status === Status.Starting) {
      api();
    }
  }, [result.data, result.status]);
  return (
    <div className="App">
      { result.status === Status.Success && result.data.type === "content" && result.data.data.display_name === null &&
        <DisplayNamePrompt />}
      <LeftColumn result={result}/>
      <header className="App-header">
        <h1>Meatball Massacre</h1>
      </header>
      <div className="App-body">
        <Dispatch result={result}/>
      </div>
      <RightColumn result={result} />
    </div>
  );
}

export default App;
