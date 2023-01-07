import React, { useState, useEffect } from 'react';
import './App.css';

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
    const data = await fetch("http://localhost/api/intra/signup", {
      method: "GET",
      headers: new Headers({'Accept': 'signup'}),
    })
    console.log(data);
    const otherdata = await data.text();
    console.log(otherdata);
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
      const data = await fetch("http://localhost/api/intra/signup", {
        method: "GET",
        headers: new Headers({'Accept': 'signup'}),
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
      <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2f605ce7cd168c6196829150ee8107490c666c503568d8afdfa27a7408086637&redirect_uri=http%3A%2F%2Flocalhost%2Fapi%2Fconfirm%2F&response_type=code" rel="noreferrer" target="_blank">
        <button> Link Button </button>
      </a>
      <a href="https://localhost/api/hello" rel="noreferrer" target="_blank">
        <button> Test Button </button>
      </a>
        <h1>This is transcendence</h1>
        <button onClick={ababa}> Auth Test </button>
        <button onClick={Example}> Hook Call </button>
        <button onClick={testMsg}> Func Call </button>
        <p>hello world</p>
        <a href={result}>
          <button> Authenticate through your intra page </button>
        </a>
        <a href={result}>Click to validate</a>
      </header>
    </div>
  );
}

export default App;
