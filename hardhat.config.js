require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const secrets = require("./secrets");

module.exports = {
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    hardhat: {},
    local_invaded: {
      chainId: 31337,
      project: "invaded",
      url: "http://127.0.0.1:8545/",
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
      ],
    },
    test_invaded: {
      chainId: 4,
      project: "invaded",
      url: secrets.rinkeby.url,
      accounts: [secrets.rinkeby.key],
    },
    main_invaded: {
      chainId: 1,
      project: "invaded",
      url: secrets.main.url,
      accounts: [secrets.main.key],
    },
  },
  etherscan: {
    apiKey: secrets.etherscanApiKey,
  },
};
