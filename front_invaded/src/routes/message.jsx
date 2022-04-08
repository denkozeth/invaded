import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useMoralis } from "react-moralis";
import bg from "../images/bg.mp4";

import contractConfig from "../contracts/contracts-config";
import TokenArtifact from "../contracts/Invaded";
import InvaderArtifact from "../contracts/Invader";
import "../App.css";
import PlaceHolders from "../config/placeholders";
import LoginButton from "../components/LoginButton";
import LazyImage from "../components/LazyImage";
import { useWalletStatus } from "../components/useWalletStatus";

export default function Message() {
  const MESSAGE_STATES = {
    TYPE: "[NEXT]",
    VALIDATING: "[VALIDATING THE MESSAGE]",
    INVALID: "[THE MESSAGE CONTAINS INVALID CHARACTERS]",
    CONFIRM: "[CONFIRM]",
    TOKENIZING: "[TOKENIZING YOUR MESSAGE, PLEASE WAIT...]",
    TOKENIZING_ERROR: "[SOMETHING WENT WRONG, TRY AGAIN LATER]",
    TOKENIZING_CONGRADS: "[CONGRADULATIONS!]",
  };
  const isReady = useWalletStatus();
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const [donation, setDonation] = useState("");
  const [donation10, setDonation10] = useState(false);
  const { isAuthenticated, isWeb3Enabled, web3 } = useMoralis();
  const [token, setToken] = useState(null);
  const [invader, setInvader] = useState(null);
  const [messageIsInvalid, setMessageIsInvalid] = useState(false);
  const [messageLines, setMessageLines] = useState([]);
  const [messageState, setMessageState] = useState(MESSAGE_STATES.TYPE);
  const [tokenId, setTokenId] = useState(0);

  async function validateMessage(message) {
    if (token && invader && !!message) {
      try {
        const isValid = await token.validateMessage(message);
        const svg = await invader.renderLines(message);
        const lines = svg.match(/>[^<]+/g);
        if (!lines) {
          return false;
        }
        lines.forEach(function (part, index) {
          this[index] = this[index].substring(1);
        }, lines);
        setMessageLines(lines);
        return isValid;
      } catch (error) {
        console.error("Failed to validate the message", error);
        return false;
      }
    }
  }

  async function next(event) {
    event.preventDefault();
    setMessageState(MESSAGE_STATES.VALIDATING);
    const isValid = await validateMessage(message.trim());
    if (isValid) {
      setMessageState(MESSAGE_STATES.CONFIRM);
    } else {
      setMessageIsInvalid(true);
      setMessageState(MESSAGE_STATES.INVALID);
    }
  }

  useEffect(() => {
    const checkMessage = async (invaded) => {
      //check if user already messaged
      try {
        const tokenId = await invaded.getYourTokenId();
        if (tokenId > 0) {
          setTokenId(tokenId.toNumber());
          setMessageState(MESSAGE_STATES.TOKENIZING_CONGRADS);
        }
      } catch (error) {
        console.log("error", error.data != null ? error.data.message : error);
      }
    };

    if (isWeb3Enabled && web3) {
      const signer = web3.getSigner();
      const invaded = new ethers.Contract(
        contractConfig.addresses.Invaded,
        TokenArtifact.abi,
        signer
      );
      setToken(invaded);
      setInvader(
        new ethers.Contract(
          contractConfig.addresses.Invader,
          InvaderArtifact.abi,
          signer
        )
      );
      checkMessage(invaded);
    }
  }, [
    isWeb3Enabled,
    isAuthenticated,
    web3,
    MESSAGE_STATES.TOKENIZING_CONGRADS,
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((seconds) => (seconds + 1) % PlaceHolders.length);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  function messageChange(event) {
    const re = /^[a-z\-\s\b]+$/;
    const re1 = /\s\s+/;
    if (
      event.target.value === "" ||
      (re.test(event.target.value.toLowerCase()) &&
        !re1.test(event.target.value.toLowerCase()))
    ) {
      setMessage(event.target.value.toLowerCase());
      setMessageIsInvalid(false);
      setMessageState(MESSAGE_STATES.TYPE);
    }
  }

  function donationChange(event) {
    const re = /^\.\d$/;
    const { value, type } = event.target;
    if (
      value === "" ||
      value === parseInt(value, 10).toString() ||
      re.test(value)
    ) {
      setDonation(value);
      return;
    }
    if (
      event.target.value === "" ||
      (type === "number" && parseFloat(value).toFixed(2))
    ) {
      if (parseFloat(value).toFixed(2) === 0) {
        setDonation(value.match(/^-?\d*(?:\.\d{0,1})?/)[0]);
      } else {
        var num = parseFloat(value).toFixed(2).toString();
        var with1Decimals = num.toString().match(/^-?\d+(?:\.\d{0,1})?/)[0];
        setDonation(with1Decimals);
      }
    }
  }

  async function confirmMessage(event) {
    if (!isWeb3Enabled) {
      console.log("authenticate first");
      return;
    }

    event.preventDefault();
    setMessageState(MESSAGE_STATES.TOKENIZING);
    const amount = donation === "" ? 0 : ethers.utils.parseEther(donation);
    try {
      const txn = await token.message(
        message,
        donation > 0 ? donation10 : false,
        {
          value: amount,
        }
      );
      const tx = await txn.wait();
      let event = tx.events[0];
      let value = event.args[2];
      // tokenID of the minted NFT
      const tokenId = value.toNumber();
      setTokenId(tokenId);
      setMessageState(MESSAGE_STATES.TOKENIZING_CONGRADS);
    } catch (error) {
      if (error.data) {
        console.log("error: " + error.data.message);
      } else {
        console.log(error);
      }
      setMessageState(MESSAGE_STATES.TOKENIZING_ERROR);
      return;
    }
    setMessageState(MESSAGE_STATES.TOKENIZING_CONGRADS);
  }

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
          {messageState === MESSAGE_STATES.TOKENIZING_CONGRADS ? (
            <div id="main" className="oe congrats-view">
              <div id="top">
                <a
                  href="/"
                  aria-current="page"
                  className="router-link-exact-active router-link-active"
                >
                  <span id="logo" className="imp bold">
                    Congradulations
                  </span>
                  <span> your message has been tokenized</span>
                </a>
              </div>
              <div id="middle" className="imp">
                {tokenId > 0 ? <LazyImage tokenId={tokenId}></LazyImage> : null}

                <div className="congrats-bottom-text">
                  <p>
                    Your message will stay forever in the decentralized
                    blockchain environment. No government or another entity will
                    be able to take it out.
                  </p>
                  <a href="https://twitter.com/Denkozeth">
                    [Follow us on Twitter for further updates]
                  </a>
                </div>
              </div>
              <div id="bottom"></div>
            </div>
          ) : (
            <div id="main" className="neg oe">
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
              <div>
                <div id="center" className="imp">
                  {messageState === MESSAGE_STATES.TYPE ||
                  messageState === MESSAGE_STATES.INVALID ||
                  messageState === MESSAGE_STATES.VALIDATING ? (
                    <>
                      <form id="message" onSubmit={next}>
                        {/*<div>one per wallet &amp; must be unique</div>*/}
                        <div>one per wallet</div>
                        <input
                          id="thought"
                          autoComplete="off"
                          type="text"
                          maxLength="72"
                          placeholder={PlaceHolders[seconds]}
                          className="input condensed"
                          onChange={messageChange}
                          disabled={messageState === MESSAGE_STATES.VALIDATING}
                          value={message}
                        ></input>
                        <div>
                          <button
                            className="next-button"
                            disabled={
                              !isReady ||
                              message.trim().length === 0 ||
                              messageIsInvalid ||
                              messageState === MESSAGE_STATES.VALIDATING
                            }
                          >
                            {messageState}
                          </button>
                        </div>
                      </form>
                      <div>
                        <br />
                        <br />
                        <div id="m-connection" className="manifold">
                          <LoginButton />
                        </div>
                      </div>
                    </>
                  ) : (
                    <form
                      id="confirm"
                      onSubmit={confirmMessage}
                      disabled={messageState !== MESSAGE_STATES.CONFIRM}
                    >
                      <button
                        id="thought-confirm"
                        className="next-button"
                        disabled={messageState !== MESSAGE_STATES.CONFIRM}
                        onClick={() => {
                          setMessageState(MESSAGE_STATES.TYPE);
                        }}
                      >
                        <div>Your message [CHANGE]</div>
                        {messageLines.map((line, index) => (
                          <React.Fragment key={index}>
                            <span>{line}</span>
                            <br />
                          </React.Fragment>
                        ))}
                      </button>
                      <br />
                      <br />
                      <br />
                      <span>your donation</span>
                      <input
                        id="donation"
                        autoComplete="off"
                        type="number"
                        min="0.0"
                        max="100000"
                        step="0.1"
                        maxLength="10"
                        placeholder="0.0 ETH"
                        onChange={donationChange}
                        className="input condensed"
                        disabled={messageState !== MESSAGE_STATES.CONFIRM}
                        onKeyDown={(evt) =>
                          (evt.key === "e" ||
                            evt.key === "E" ||
                            evt.key === "+" ||
                            evt.key === "-") &&
                          evt.preventDefault()
                        }
                        value={donation}
                      />
                      {donation != null && donation > 0 ? (
                        <div className="donation">
                          <input
                            id="donation10"
                            type="checkbox"
                            className="input condensed"
                            name="donation10"
                            defaultChecked={donation10}
                            disabled={messageState !== MESSAGE_STATES.CONFIRM}
                            onChange={(e) => {
                              setDonation10(e.target.checked);
                            }}
                          />
                          <label htmlFor="donation10">
                            10% To support us to do what we are doing
                          </label>
                        </div>
                      ) : null}
                      <br />
                      <div>
                        <button
                          className="next-button"
                          disabled={
                            !isReady ||
                            (messageState !== MESSAGE_STATES.CONFIRM &&
                              messageState !== MESSAGE_STATES.TOKENIZING_ERROR)
                          }
                        >
                          {messageState}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
              <div id="bottom"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
