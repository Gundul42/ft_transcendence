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
      const data = await fetch("https://localhost/api/auth", {
        method: "GET"
      });
      const otherdata = await (await data.blob()).text();
      setResult(otherdata.slice(otherdata.indexOf("<a"), otherdata.lastIndexOf("</a>") + 4). replaceAll(/\\\"/g, "\""));
    };

    api();
  }, []);
  console.log(result)
  return (
    <div className="App">
      <header className="App-header">
        <h1>This is my app</h1>
        <p>hello</p>
        {result}
      </header>
    </div>
  );
}

export default App;
