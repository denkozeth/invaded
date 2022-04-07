import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import contractConfig from "../contracts/contracts-config";

const useWalletStatus = () => {
  const { isWeb3Enabled, chainId } = useMoralis();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(
      isWeb3Enabled &&
        chainId !== null &&
        parseInt(chainId.toString(), 16) === contractConfig.chainId
    );
    return;
  }, [isWeb3Enabled, chainId]);

  return isReady;
};

export { useWalletStatus };
