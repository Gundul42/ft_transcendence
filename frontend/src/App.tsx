import React, { useState, useEffect } from 'react';
// import { useState } from 'react';
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
function AuthMsg()
{
  const [msg, setMsg] = useState<string>();
  var val;
  useEffect(() => {
    console.log("inside hook");
    (async () => {
      const data = await fetch("https://localhost/api/intra/auth", {
        method: "GET",
        headers: new Headers({'Content-Type': 'text/html'}),
      })
      const otherdata = await (await data.blob()).text();
      setMsg(otherdata);
    })();
    }, [val]);
  if (!msg)
  {
    val = false;
    console.log("here");
    return (
      <div>
        <p>Error occured</p>
      </div>
    );
  }
  val = true;
  if (msg?.startsWith("Congrats"))
  {
    return (
      <div>
        <p>{msg}</p>
      </div>
    );
  }
  else
  {
    const linkadr = msg.slice(msg.indexOf("https://"), msg.lastIndexOf("\">"));
    return (
      <div>
        <a href={linkadr}>Auth here</a>
      </div>
    );
  }
}
// function Fett()
// {
//   const api = async () => {
//     const data = await fetch("https://localhost/api/intra/auth", {
//       method: "GET",
//       headers: new Headers({'Content-Type': 'text/html'}),
//     })
//     const otherdata = await (await data.blob()).text();
//     return (otherdata);
//     // if (otherdata.startsWith("Congrats"))
//     // {
//     //   return (
//     //     <div>
//     //     <p>{otherdata}</p>
//     //     </div>
//     //   )
//     // }
//     // else
//     // {
//     //   const linkadr = otherdata.slice(otherdata.indexOf("https://"), otherdata.lastIndexOf("\">"));
//     //   return (
//     //     <div>
//     //     <a href={linkadr}>
//     //       Click to validate
//     //     </a>
//     //     </div>
//     //   )
//     // }
//   }
//   try
//   {
//     api();
//     // const [result, setResult] = useState<string>();
//         // setResult(otherdata.slice(otherdata.indexOf("https://"), otherdata.lastIndexOf("\">")));
//   }
//   catch (error)
//   {
//     if (error instanceof Error)
//         console.log(error.message);
//   }
//   return (
//     <div>
//           <p>Error occured</p>
//     </div>
//   )
// }

function App() {
  // const [result, setResult] = useState<string>();
  // useEffect(() => {
  //   const api = async () => {
  //     const data = await fetch("https://localhost/api/intra/auth", {
  //       method: "GET",
  //       headers: new Headers({'Content-Type': 'text/html'}),
  //     })
  //     const otherdata = await (await data.blob()).text();
  //     setResult(otherdata.slice(otherdata.indexOf("https://"), otherdata.lastIndexOf("\">")));
  // };

  //   api();
  // }, []);
  return (
    <div className="App">
      <header className="App-header">
      <a href="https://localhost/api/intra/hello" rel="noreferrer" target="_blank">
        <button> Test Button </button>
      </a>
        <h1>This is transcendence</h1>
        <Example></Example>
        <button onClick={testMsg}> Func Call </button>
        <p>hello world</p>
        <AuthMsg></AuthMsg>
        {/* <a href={result}>Click to validate</a> */}
      </header>
    </div>
  );
}

export default App;
