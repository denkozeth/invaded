import "../App.css";
import "../manifold.css";
import { useMoralis } from "react-moralis";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import contractConfig from "../contracts/contracts-config";
import TokenArtifact from "../contracts/Invaded";

function LazyImage(props) {
  const tokenId = props.tokenId;
  const { isAuthenticated, web3, isWeb3Enabled } = useMoralis();
  const [invadedToken, setInvadedToken] = useState(null);
  const svg =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000' viewBox='0 0 1000 1000'><style>@font-face {font-family: 'C';src: url('data:font/woff2;charset=utf-8;base64,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') format('woff2');font-weight: 500;font-style: normal;font-display: swap;}.f {width: 100%;height: 100%;} .b {fill: black;} .a {animation: o 2s ease-out infinite;}@keyframes o { 10% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }tspan { fill: lightgray; font-family: 'C'; font-size: 70px; text-transform: uppercase; text-anchor: middle; }</style><rect class='b f' /><svg y='525' overflow='visible'><text><tspan x='500'>Loading</tspan></text></svg><rect class='b f a' /></svg>";

  useEffect(() => {
    const checkMessage = async (invaded) => {
      //check if user already messaged
      try {
        if (tokenId > 0) {
          const tokenURI = await invaded.tokenURI(tokenId);
          setInvadedToken({
            Id: tokenId,
            Token: JSON.parse(tokenURI.substring(27)),
          });
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

      checkMessage(invaded);
    }
  }, [isWeb3Enabled, isAuthenticated, web3, tokenId]);

  return invadedToken ? (
    <>
      <img
        id="mitedMessage"
        alt="Your message"
        src={invadedToken.Token.image}
      />
      <div className="congrats-contract">
        Contract: {contractConfig.addresses.Invaded}
      </div>
      <a
        href={
          (contractConfig.chainId === 1
            ? "https://opensea.io/assets/"
            : "https://testnets.opensea.io/assets/") +
          contractConfig.addresses.Invaded +
          "/" +
          invadedToken.Id
        }
      >
        [VIEW INVADED #{invadedToken.Id} ON OPENSEA]
      </a>
    </>
  ) : (
    <img id="mitedMessage" alt="Your message" src={svg} />
  );
}

export default LazyImage;
