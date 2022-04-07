// This is a script for deploying your contracts. You can adapt it to deploy

const { FixedNumber } = require("ethers");

// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat" || network.name === "local") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is avaialble in the global scope
  const [deployer, addr1] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );
  console.log("addr1:", await addr1.getAddress());

  const project = network.config.project;
  console.log("Project:", project);
  console.log("Chain ID:", network.config.chainId);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const contractsDir = __dirname + "/../front_" + project + "/src/contracts/";
  const fs = require("fs");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  const contractsFile = contractsDir + "contracts-config.json";
  fs.unlink(contractsFile, (err) => {
    if (err && err.code == "ENOENT") {
      // file doens't exist
      console.info(contractsFile + " file doesn't exist, won't remove it.");
    } else if (err) {
      throw err;
    }
  });
  fs.writeFileSync(
    contractsFile,
    JSON.stringify(
      { chainId: network.config.chainId, addresses: {} },
      undefined,
      2
    )
  );

  if (project === "invaded") {
    const Invaded = await ethers.getContractFactory("Invaded");
    const invaded = await Invaded.deploy();
    await invaded.deployed();
    console.log("Invaded address:", invaded.address);
    // We also save the contract's artifacts and address in the frontend directory
    saveFrontendFiles(contractsFile, "Invaded", invaded);

    const Invader = await ethers.getContractFactory("Invader");
    const invader = await Invader.deploy();
    await invader.deployed();
    console.log("Invader address:", invader.address);
    // We also save the contract's artifacts and address in the frontend directory
    saveFrontendFiles(contractsFile, "Invader", invader);
    // Assign Invader
    await invaded.updateTokenMetadata([], invader.address);

    const Community = await ethers.getContractFactory("Community");
    const community = await Community.deploy();
    await community.deployed();
    await community.updateTokenMetadata([], invader.address);
    await community.transferOwnership(addr1.getAddress());
    console.log("Community address:", community.address);
    await community.connect(addr1).message("communitytoken", false);
    // Assign test community
    await invaded.updateCommunity(community.address, "NftCommunity");
  }
}

function saveFrontendFiles(file, name, token) {
  const fs = require("fs");
  const fileContent = JSON.parse(fs.readFileSync(file));
  fileContent.addresses[name] = token.address;
  fs.writeFileSync(file, JSON.stringify(fileContent));
  const Artifact = artifacts.readArtifactSync(name);
  const contractsDir = file.substring(0, file.lastIndexOf("/") + 1);
  fs.writeFileSync(
    contractsDir + "/" + name + ".json",
    JSON.stringify(Artifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
