import React, { useState, useEffect } from 'react';
import './App.css';
import { testMsg, Example } from './context/auth0-context';

// async function api<T>(url: string): Promise<T> {
//   return (await fetch(url)
//     .then(response => {
//       if (!response.ok) {
//         throw new Error(response.statusText);
//       }
//       return response.json() as Promise<T>;
//     }))
// }

// async function auth(): Promise<htmlObject> {
//   let res: Promise<htmlObject>
//   .then(
//     ((value) => {
//       res = value;
//     })
//   )
//   return (res);
// }
async function ababa()
{
  try
  {
    const data = await fetch("https://localhost/api/intra/auth", {
      method: "GET",
      headers: new Headers({'Accept': 'auth'}),
    })
    console.log(data);
    const otherdata = await data.text();
    console.log(otherdata.slice(otherdata.indexOf("https://"), otherdata.lastIndexOf("\">")));
  }
  catch (error)
  {
    if (error instanceof Error)
      console.log(error.message);
  }
}


// const auth = async () => {
//   const res: htmlObject = await api("https://localhost/api/auth");
//   return res;
// }

function App() {
  const [result, setResult] = useState<string>();
  useEffect(() => {
    const api = async () => {
      const data = await fetch("https://localhost/api/intra/auth", {
        method: "GET",
        headers: new Headers({'Content-Type': 'auth'}),
      })
      const otherdata = await (await data.blob()).text();
      setResult(otherdata.slice(otherdata.indexOf("https://"), otherdata.lastIndexOf("\">")));
  };

    api();
  }, []);

  console.log(result)
  return (
    <div className="App">
      <header className="App-header">
      <a href="https://localhost/api/intra/hello" rel="noreferrer" target="_blank">
        <button> Test Button </button>
      </a>
        <h1>This is transcendence</h1>
        <button onClick={ababa}> Auth Test </button>
        <button onClick={Example}> Hook Call </button>
        <button onClick={testMsg}> Func Call </button>
        <p>hello world</p>
        <a href={result}>Click to validate</a>
      </header>
    </div>
  );
}

export default App;
