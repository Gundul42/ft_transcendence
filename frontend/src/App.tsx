import React, { useState, useEffect } from 'react';
import './App.css';

function Home({data} : {data: any}) {
  return(<h1>Welcome {(data.full_name as string).split(' ')[0]}</h1>)
}

function Link({data} : {data: any}) {
  return (<a href={data.link}>Login</a>)
}

enum Status {
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

function Dispatch() {
  const [result, setResult] = useState<IApi>({
    status: Status.Loading,
    error: null,
    data: null,
  });
  useEffect(() => {
    const api = () => {
      fetch("https://localhost/api/auth", {
        method: "GET"
      })
      .then(
        async (value) => {
          if (value.ok) {
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
    if (result.data === null) {
      api();
    }
  }, [result.data]);
  console.log(result);
  if (result.data === null) {
    return (<p>*Sad backend noises*</p>);
  }
  if (result.data.type === 'link') {
    return (<Link data={result.data.data} />);
  } else if (result.data.type === 'content') {
    return (<Home data={result.data.data} />);
  } else {
    return (<p>Something went wrong</p>)
  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Meatball Massacre</h1>
        <Dispatch />
      </header>
    </div>
  );
}

export default App;
