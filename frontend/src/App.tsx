import React, { useState, useEffect } from 'react';
import './App.css';

type htmlObject = {
  html: string;
}

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

// const auth = async () => {
//   const res: htmlObject = await api("https://localhost/api/auth");
//   return res;
// }

function App() {
  const [result, setResult] = useState<string>();
  useEffect(() => {
    const api = async () => {
      const data = await fetch("https://localhost:8000/hello", {
        method: "GET"
      });
      const otherdata = await (await data.blob()).text();
      setResult(otherdata.slice(otherdata.indexOf("<a"), otherdata.lastIndexOf("</a>") + 4).replaceAll(/\\"/g, "\""));
    };

    api();
  }, []);

  console.log(result)
  return (
    <div className="App">
      <header className="App-header">
      <a href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2f605ce7cd168c6196829150ee8107490c666c503568d8afdfa27a7408086637&redirect_uri=http%3A%2F%2Flocalhost%3A4242%2F&response_type=code" rel="noreferrer" target="_blank">
        <button> Link Button </button>
      </a>
        <h1>This is my app</h1>
        <p>hello</p>
        {result}
      </header>
    </div>
  );
}

export default App;
