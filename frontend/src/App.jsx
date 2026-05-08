import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const [url, setUrl] = useState("");
  const [info, setInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [converting, setConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const fetchInfo = async () => {
    setLoadingInfo(true);

    try {
      console.log("TRYING")
      console.log(JSON.stringify({url}))
      const res = await fetch(`${API}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      console.log(data)

      if (data.error) {
        alert(data.error);
        return;
      }

      setInfo(data);
    }
    catch (err) {
      console.log("FAILED TO FETCH VIDEO INFO ERROR")
      console.error(err);
      alert("Failed to fetch video info");
    }
    finally {
      setLoadingInfo(false);
    }
  };

  const convert = async () => {
    setConverting(true);

    try {
      const res = await fetch(`${API}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      console.log(data)

      setDownloadUrl(data.download);
    }
    catch (err) {
      console.error(err);
      alert("Conversion failed");
    }
    finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-xl bg-zinc-800 rounded-2xl p-6 shadow-xl">

        <h1 className="text-3xl font-bold mb-6 text-center">
          YouTube to MP3
        </h1>

        <input
          type="text"
          placeholder="Paste YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-3 rounded-lg bg-zinc-700 outline-none"
        />

        <button
          onClick={fetchInfo}
          disabled={loadingInfo}
          className="w-full mt-4 bg-red-500 hover:bg-red-600 p-3 rounded-lg font-semibold"
        >
          {loadingInfo
            ?
            <div className="flex justify-center items-center">
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            : "Fetch Video"}
        </button>

        {info && (
          <div className="mt-6">

            <img
              src={info.thumbnail}
              alt="thumbnail"
              className="rounded-xl mb-4"
            />

            <h2 className="text-xl font-semibold">
              {info.title}
            </h2>

            <p className="text-zinc-400">
              {info.uploader}
            </p>

            <button
              onClick={convert}
              disabled={converting}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 p-3 rounded-lg font-semibold"
            >
              {converting
                ?
                <div className="flex justify-center items-center">
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                : "Convert to MP3"}
            </button>
          </div>
        )}

        {downloadUrl && (
          <a
            href={downloadUrl}
            className="block mt-6 bg-blue-500 hover:bg-blue-600 p-3 rounded-lg text-center font-semibold"
          >
            Download MP3
          </a>
        )}

      </div>
      <h4 className="fixed bottom-0 left-0 w-full mb-6 text-center text-zinc-400 font-medium text-lg">
        dumbass app by yash
      </h4>
    </div>
  );

  /*
  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
  */
}

export default App
