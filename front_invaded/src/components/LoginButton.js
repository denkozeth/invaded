import "../App.css";
import "../manifold.css";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import contractConfig from "../contracts/contracts-config";
import detectEthereumProvider from "@metamask/detect-provider";

function LoginButton() {
  const {
    isAuthenticated,
    isAuthenticating,
    authenticate,
    isWeb3Enabled,
    isWeb3EnableLoading,
    account,
    enableWeb3,
    chainId,
    logout,
  } = useMoralis();
  const [connectWallet, setConnectWallet] = useState(false);
  const [metamaskIsAvailable, setMetamaskIsAvailable] = useState(false);

  useEffect(() => {
    const checkMetamask = async () => {
      //check if metamask is available
      const provider = await detectEthereumProvider();
      setMetamaskIsAvailable(provider != null);
    };

    checkMetamask();
  }, [isAuthenticated, isWeb3Enabled]);

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) {
      if (window.localStorage.walletconnect) {
        enableWeb3({
          provider: "walletconnect",
          signingMessage: "Sign in to say what you think",
          chainId: 4,
        }).then((provider) => {
          if (provider == null) {
            //if user cancels WC window
            window.localStorage.removeItem("walletconnect");
          }
        });
      } else {
        enableWeb3();
      }
    }
  }, [isAuthenticated]);

  function add3Dots(string) {
    var dots = "...";
    if (string.length > 11) {
      // you can also use substr instead of substring
      string =
        string.substring(0, 5) +
        dots +
        string.substring(string.length - 3, string.length);
    }

    return string;
  }

  async function WalletConnectAuth() {
    const user = await authenticate({
      provider: "walletconnect",
      signingMessage: "Sign in to say what you think",
      chainId: 4,
      /*mobileLinks: [
        "rainbow",
        "metamask",
        "argent",
        "trust",
        "imtoken",
        "pillar",
      ],*/
    });
    //if (user != null) {
    //  window.localStorage.walletconnect = "walletconnect";
    //}
  }

  const WalletConnect = () => {
    return (
      <button
        onClick={() => WalletConnectAuth()}
        className="m-connection-wallet-option walletconnect"
      >
        Wallet Connect
      </button>
    );
  };

  const ConnectMetamask = () => {
    return metamaskIsAvailable ? (
      <button
        onClick={() =>
          authenticate({ signingMessage: "Sign in to say what you think" })
        }
        disabled={isAuthenticating}
        className="m-connection-wallet-option metamask"
      >
        Metamask
      </button>
    ) : null;
  };

  return (
    <>
      {isWeb3Enabled ? (
        parseInt(chainId.toString(), 16) !== contractConfig.chainId ? (
          <button
            className="m-connection-wrong-network"
            onClick={() => {
              window.localStorage.removeItem("walletconnect");
              logout();
            }}
          >
            <span>wrong network</span>
          </button>
        ) : (
          <button
            onClick={() => {
              window.localStorage.removeItem("walletconnect");
              logout();
            }}
            disabled={isAuthenticating}
            className="m-connection-disconnect-wallet"
          >
            <span>disconnect: {add3Dots(account)}</span>
          </button>
        )
      ) : (
        <>
          {connectWallet ? (
            <div
              className="m-connection-wallet-options"
              onClick={() => setConnectWallet(false)}
            >
              <WalletConnect />
              <ConnectMetamask />
            </div>
          ) : (
            <button
              onClick={() => setConnectWallet(true)}
              disabled={isAuthenticating}
              className="m-connection-connect-wallet"
            >
              {isAuthenticating ? (
                <span>Logging in...</span>
              ) : (
                <span>
                  connect <span>wallet</span>
                </span>
              )}
            </button>
          )}
        </>
      )}
    </>
  );
}

export default LoginButton;
