import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Message from "./routes/message";
import More from "./routes/more";
import { MoralisProvider } from "react-moralis";
import reportWebVitals from "./reportWebVitals";
import contractConfig from "./contracts/contracts-config";

ReactDOM.render(
  <MoralisProvider
    appId={
      contractConfig.chainId === 1
        ? process.env.REACT_APP_API_KEY_MAIN
        : process.env.REACT_APP_API_KEY
    }
    serverUrl={
      contractConfig.chainId === 1
        ? process.env.REACT_APP_URL_MAIN
        : process.env.REACT_APP_URL
    }
  >
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="message" element={<Message />}></Route>
        <Route path="more" element={<More />}></Route>
      </Routes>
    </BrowserRouter>
  </MoralisProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
