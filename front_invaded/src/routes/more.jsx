import bg from "../images/bg.mp4";
import "../App.css";

export default function More() {
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
          <div id="main" className="oe readmore-view">
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
            <div id="middle" className="imp">
              <p>
                This collection is created by people like you. People who can't
                stand what is happening and need to do something about it. We
                are not a company and don't have any business in crypto. To
                create it we used only free and open tools. We didn't use any
                middleman or hired anyone.
              </p>
              <br />
              <p>
                The collection is free to mint, but please donate if you can.
                Keep in mind that you are required to pay for fees when minting
                an NFT work. All donations will be sent to the official Ukraine
                ETH donation address:
                <a
                  className="imp"
                  href="https://etherscan.io/address/0x165CD37b4C644C2921454429E7F9358d18A45e14"
                >
                  [0x165CD37b4C644C2921454429E7F9358d18A45e14]
                </a>{" "}
                by the smart contract. Also, you are{" "}
                <span className="bold">free</span> to say what you think or feel
                about what is happening. Your message will be tokenized in this
                collection no government or other entity would be able to take
                it out. Only one message per wallet is allowed and NFT tokens
                will be non-transferrable before Ukraine gets{" "}
                <span className="bold">free</span>.
              </p>
              <br />
              <p>
                Please spread the word about this collection, it is time to show
                how powerful crypto community is. By helping Ukraine, we are
                also protecting our <span className="bold">freedom</span>.
              </p>
              <br />
            </div>
            <div id="bottom" className="imp">
              <p>
                A special thanks to{" "}
                <a href="https://twitter.com/muratpak" className="imp">
                  [Pak]
                </a>{" "}
                and his Censored collection for inspiring us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
