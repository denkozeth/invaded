import { Link } from "react-router-dom";
import "./App.css";
import bg from "./images/bg.mp4";
import LoginButton from "./components/LoginButton";
import contractConfig from "./contracts/contracts-config";

function App() {
  return (
    <div id="app">
      <video
        id="bgvid"
        autoPlay
        loop
        muted
        src={bg}
        type="video/mp4"
        style={{ display: "none" }}
      />
      <div className="container">
        <div>
          <div id="main">
            <div id="top">
              <a
                href="/"
                aria-current="page"
                className="router-link-exact-active router-link-active"
              >
                <span id="logo" className="imp bold">
                  invaded
                </span>
                <span> is a collection by you to help Ukraine</span>
              </a>
            </div>
            <div id="center">
              <br />
              <br />
              <br />
              <br />
              <Link to="/message">
                <span className="bold">tokenize</span> a message
              </Link>
              {/*
              <a href="/vanguards">
                <span className="bold">see</span> vanguards{" "}
              </a>
              <a href="https://www.google.com/search?q=invaded">
                <span className="bold">read</span> more{" "}
              </a>
              */}

              <Link to="/more">
                <span className="bold">Read</span> more
              </Link>
              <a
                href={
                  contractConfig.chainId === 1
                    ? "https://opensea.io/collection/invaded"
                    : "https://testnets.opensea.io/collection/invaded-v3"
                }
              >
                <span className="bold">See</span> more
              </a>
              <div id="m-connection" className="manifold">
                <LoginButton />
              </div>
            </div>
            <div id="bottom">
              <a href="https://twitter.com/Denkozeth">[Follow us on Twitter]</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
