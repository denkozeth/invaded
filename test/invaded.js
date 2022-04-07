// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` recieves the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("invaded contract tests", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addr5;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Invaded = await ethers.getContractFactory("Invaded");
    [owner, addr1, addr2, addr3, addr4, addr5, ...addrs] =
      await ethers.getSigners();

    //make sure that we have out test address for tests:
    const contractFile = __dirname + "/../contracts/invaded/invaded.sol";
    const fs = require("fs");
    const fileContent = fs.readFileSync(contractFile);
    fs.writeFileSync(
      contractFile,
      fileContent
        .toString()
        .replace(/0x165CD37b4C644C2921454429E7F9358d18A45e14/g, addr1.address)
    );

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    invaded = await Invaded.deploy();
    await invaded.deployed();

    Invader = await ethers.getContractFactory("Invader");
    invader = await Invader.deploy();
    await invader.deployed();
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an assertion objet. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await invaded.owner()).to.equal(owner.address);

      const accounts = await ethers.getSigners();
      for (const account of accounts) {
        console.log(account.address, (await account.getBalance()).toString());
      }
    });

    it("transferOwnership", async function () {
      expect(await invaded.owner()).to.equal(owner.address);
      await invaded.transferOwnership(addr1.address);
      expect(await invaded.owner()).to.equal(addr1.address);
      await expect(
        invaded.updateTokenMetadata([], invader.address)
      ).to.be.revertedWith("AdminControl: Must be owner or admin");
      invaded.connect(addr1).updateTokenMetadata([], invader.address);
      await invaded.connect(addr1).message("nowar", false);
    });

    it("Test supported interfaces", async function () {
      const IERC721 = 0x80ac58cd;
      const IERC721Metadata = 0x5b5e139f;
      expect(await invaded.supportsInterface(IERC721)).to.be.true;
      expect(await invaded.supportsInterface(IERC721Metadata)).to.be.true;
    });
  });

  describe("Reserved", function () {
    beforeEach(async function () {
      Reserved = await ethers.getContractFactory("UkReserved");
      reserved = await Reserved.deploy();
      await reserved.deployed();
    });

    it("First token exist (activate reserved)", async function () {
      await invaded.updateTokenMetadata([], invader.address);
      await invaded.message("n-owar", false);
      await invaded.activateReserved(reserved.address);
      expect(await invaded.tokenURI(1)).to.not.be.empty;
      expect(await invaded.activateReserved(reserved.address)).to.be.ok;
    });

    it("First token doesn't exist", async function () {
      await invaded.updateTokenMetadata([], invader.address);
      await invaded.message("n-owar", false);
      await expect(invaded.tokenURI(1)).to.be.revertedWith(
        "ERC721Metadata: URI query for nonexistent token"
      );
      expect(await invaded.tokenURI(2)).to.not.be.empty;
    });
  });

  describe("Transfer", function () {
    beforeEach(async () => {
      await invaded.updateTokenMetadata([], invader.address);
    });

    it("setApprovalForAll", async function () {
      await invaded.setFreedom([], true);
      await invaded.message("no war", false);
      await invaded.setApprovalForAll(addr1.address, true);
      expect(
        await invaded
          .connect(addr1)
          .transferFrom(owner.address, addr2.address, 2)
      ).to.be.ok;
    });

    it("Can't transfer before freedom", async function () {
      await invaded.message("no war", false);
      await expect(
        invaded.transferFrom(owner.address, addr1.address, 2)
      ).to.be.revertedWith("ERC721: transfer not permitted");
    });

    it("Can transfer after freedom", async function () {
      await invaded.message("no war", false);
      await invaded.setFreedom([], true);
      expect(await invaded.transferFrom(owner.address, addr1.address, 2)).to.be
        .ok;
    });

    it("Can't transfer after freedom turned off again", async function () {
      await invaded.message("no war", false);
      await invaded.setFreedom([], true);
      expect(await invaded.transferFrom(owner.address, addr1.address, 2)).to.be
        .ok;
      await invaded.setFreedom([], false);
      await expect(
        invaded.connect(addr1).transferFrom(addr1.address, addr2.address, 2)
      ).to.be.revertedWith("ERC721: transfer not permitted");
    });

    it("Set freedom for specific token", async () => {
      await invaded.message("nowar", true, {
        value: ethers.utils.parseEther("9"),
      });
      invaded.connect(addr1).message("nowar", true, {
        value: ethers.utils.parseEther("9"),
      });
      invaded.connect(addr2).message("nowar", true, {
        value: ethers.utils.parseEther("9"),
      });
      invaded.connect(addr3).message("nowar", true, {
        value: ethers.utils.parseEther("9"),
      });
      invaded.connect(addr4).message("nowar-qq", true, {
        value: ethers.utils.parseEther("9"),
      });

      await invaded.setFreedom([2, 4], true);

      expect(await invaded.transferFrom(owner.address, addr1.address, 2)).to.be
        .ok;
      await expect(
        invaded.connect(addr1).transferFrom(addr1.address, addr2.address, 3)
      ).to.be.revertedWith("ERC721: transfer not permitted");
      expect(
        await invaded
          .connect(addr2)
          .transferFrom(addr2.address, owner.address, 4)
      ).to.be.ok;

      await expect(
        invaded.connect(addr3).transferFrom(addr3.address, owner.address, 5)
      ).to.be.revertedWith("ERC721: transfer not permitted");
    });
  });

  describe("Invader", function () {
    it("No Invader assigned yet: should revert", async function () {
      await expect(invaded.message("no war", false)).to.be.revertedWith(
        "function call to a non-contract account"
      );
    });
    it("Can message after Invader is assigned", async function () {
      await invaded.updateTokenMetadata([], invader.address);
      expect(await invaded.message("nowar", false)).to.be.ok;
    });
    it("Can't message after Invader removed", async function () {
      await invaded.updateTokenMetadata([], invader.address);
      await invaded.updateTokenMetadata(
        [],
        "0x0000000000000000000000000000000000000000"
      );
      await expect(invaded.message("no war", false)).to.be.revertedWith(
        "function call to a non-contract account"
      );
    });
    it("Only admin can set Invader", async function () {
      await expect(
        invaded.connect(addr1).updateTokenMetadata([], invader.address)
      ).to.be.revertedWith("AdminControl: Must be owner or admin");
    });
    it("Only admin can mint first", async () => {
      await invaded.updateTokenMetadata([], invader.address);
      await expect(
        invaded.connect(addr1).message("nowar", true, {
          value: ethers.utils.parseEther("9"),
        })
      ).to.be.revertedWith("Cannot message");
      expect(
        await invaded.message("nowar", true, {
          value: ethers.utils.parseEther("9"),
        })
      ).to.be.ok;
      expect(
        await invaded.connect(addr1).message("nowar - second", true, {
          value: ethers.utils.parseEther("9"),
        })
      ).to.be.ok;
    });

    it("Set Invader for specific token", async () => {
      await invaded.updateTokenMetadata([], invader.address);
      await invaded.message("nowar", true, {
        value: ethers.utils.parseEther("9"),
      });
      invaded.connect(addr1).message("nowar", true, {
        value: ethers.utils.parseEther("9"),
      });
      invaded.connect(addr2).message("nowar", true, {
        value: ethers.utils.parseEther("9"),
      });
      invaded.connect(addr3).message("nowar", true, {
        value: ethers.utils.parseEther("9"),
      });
      invaded.connect(addr4).message("nowar-qq", true, {
        value: ethers.utils.parseEther("9"),
      });

      await invaded.updateTokenMetadata([2, 4], addr5.address);

      await expect(invaded.tokenURI(2)).to.be.revertedWith(
        "function call to a non-contract account"
      );
      await invaded.tokenURI(3);
      await expect(invaded.tokenURI(4)).to.be.revertedWith(
        "function call to a non-contract account"
      );
      await invaded.tokenURI(5);
    });

    it("Deactivate", async function () {
      await invaded.updateTokenMetadata([], invader.address);
      expect(await invaded.message("nowar", false)).to.be.ok;
      await invaded.deactivate(1647952891);
      await expect(
        invaded.connect(addr1).message("nowar-", true, {
          value: ethers.utils.parseEther("9"),
        })
      ).to.be.revertedWith("Cannot message");
    });
  });

  describe("CommunityTag", function () {
    let community;
    beforeEach(async () => {
      await invaded.updateTokenMetadata([], invader.address);

      const Community = await ethers.getContractFactory("Community");
      community = await Community.deploy();
      await community.deployed();
      await community.updateTokenMetadata([], invader.address);
      await community.transferOwnership(addr1.getAddress());
      await community.connect(addr1).message("test", false);
    });

    it("Community tag is available (owner)", async function () {
      await invaded.updateCommunity(community.address, "NftCommunity");
      await invaded.message("nowar", false);
      await invaded.connect(addr1).message("freedom", false);
      const token = await invaded.connect(addr1).tokenURI(3);
      const mdata = JSON.parse(token.substring(27));
      const c = mdata.attributes.filter(function (a) {
        return a.trait_type === "Community";
      });
      expect(c.length).to.be.equal(1);
      const communities = await invaded.getCommunities();
      expect(communities.length).to.be.equal(1);
    });

    it("Community tag is available (non-owner)", async function () {
      await invaded.updateCommunity(community.address, "NftCommunity");
      await invaded.message("nowar", false);
      await invaded.connect(addr1).message("freedom", false);
      const token = await invaded.tokenURI(3);
      const mdata = JSON.parse(token.substring(27));
      const c = mdata.attributes.filter(function (a) {
        return a.trait_type === "Community";
      });
      expect(c.length).to.be.equal(1);
    });

    it("Community tag is empty", async function () {
      await invaded.message("nowar", false);
      await invaded.connect(addr1).message("freedom", false);
      const token = await invaded.connect(addr1).tokenURI(3);
      const mdata = JSON.parse(token.substring(27));
      const c = mdata.attributes.filter(function (a) {
        return a.trait_type === "Community";
      });
      expect(c.length).to.be.equal(0);

      const communities = await invaded.getCommunities();
      expect(communities.length).to.be.equal(0);
    });

    it("Two Communities assigned", async function () {
      await invaded.updateCommunity(community.address, "Community");

      const CommunityTwo = await ethers.getContractFactory("CommunityTwo");
      community2 = await CommunityTwo.deploy();
      await community2.deployed();
      await community2.updateTokenMetadata([], invader.address);
      await community2.transferOwnership(addr1.getAddress());
      await community2.connect(addr1).message("test two", false);

      await invaded.updateCommunity(community2.address, "CommunityTwo");
      const communities = await invaded.getCommunities();
      expect(communities.length).to.be.equal(2);
    });

    it("First found community used for tag #1", async function () {
      await invaded.updateCommunity(community.address, "Community");

      const CommunityTwo = await ethers.getContractFactory("CommunityTwo");
      community2 = await CommunityTwo.deploy();
      await community2.deployed();
      await community2.updateTokenMetadata([], invader.address);
      await community2.transferOwnership(addr1.getAddress());
      await community2.connect(addr1).message("test two", false);
      await invaded.updateCommunity(community2.address, "CommunityTwo");

      await invaded.message("nowar", false);
      await invaded.connect(addr1).message("freedom", false);
      let token = await invaded.tokenURI(3);
      let mdata = JSON.parse(token.substring(27));
      let c = mdata.attributes.filter(function (a) {
        return a.trait_type === "Community";
      });
      expect(c[0].value).to.be.equal("Community");
    });

    it("First found community used for tag #2", async function () {
      await invaded.updateCommunity(community.address, "Community");

      const CommunityTwo = await ethers.getContractFactory("CommunityTwo");
      community2 = await CommunityTwo.deploy();
      await community2.deployed();
      await community2.updateTokenMetadata([], invader.address);
      await community2.transferOwnership(addr1.getAddress());
      await community2.connect(addr1).message("test two", false);
      await invaded.updateCommunity(community2.address, "CommunityTwo");

      await invaded.updateCommunity(community.address, "");
      await invaded.message("nowar", false);
      await invaded.connect(addr1).message("freedom", false);
      const token = await invaded.tokenURI(3);
      const mdata = JSON.parse(token.substring(27));
      const c = mdata.attributes.filter(function (a) {
        return a.trait_type === "Community";
      });
      expect(c[0].value).to.be.equal("CommunityTwo");
    });

    it("First found community used for tag #3", async function () {
      await invaded.updateCommunity(community.address, "Community");

      const CommunityTwo = await ethers.getContractFactory("CommunityTwo");
      community2 = await CommunityTwo.deploy();
      await community2.deployed();
      await community2.updateTokenMetadata([], invader.address);
      await community2.transferOwnership(addr1.getAddress());
      await community2.connect(addr1).message("test two", false);
      await invaded.updateCommunity(community2.address, "CommunityTwo");

      await invaded.updateCommunity(community.address, "");
      await invaded.updateCommunity(community.address, "CommunityOne");
      await invaded.message("nowar", false);
      await invaded.connect(addr1).message("freedom", false);
      const token = await invaded.tokenURI(3);
      const mdata = JSON.parse(token.substring(27));
      const c = mdata.attributes.filter(function (a) {
        return a.trait_type === "Community";
      });
      expect(c[0].value).to.be.equal("CommunityTwo");
    });

    it("First found community used for tag #4", async function () {
      await invaded.updateCommunity(community.address, "Community");

      const CommunityTwo = await ethers.getContractFactory("CommunityTwo");
      community2 = await CommunityTwo.deploy();
      await community2.deployed();
      await community2.updateTokenMetadata([], invader.address);
      await community2.transferOwnership(addr1.getAddress());
      await community2.connect(addr1).message("test two", false);
      await invaded.updateCommunity(community2.address, "CommunityTwo");

      await invaded.updateCommunity(community.address, "");
      await invaded.updateCommunity(community.address, "CommunityOne");
      await invaded.updateCommunity(community2.address, "");
      await invaded.updateCommunity(community2.address, "ReAdded");
      await invaded.message("nowar", false);
      await invaded.connect(addr1).message("freedom", false);
      const token = await invaded.tokenURI(3);
      const mdata = JSON.parse(token.substring(27));
      const c = mdata.attributes.filter(function (a) {
        return a.trait_type === "Community";
      });
      expect(c[0].value).to.be.equal("CommunityOne");

      let communities = await invaded.getCommunities();
      expect(communities.length).to.be.equal(2);
      await invaded.updateCommunity(community.address, "");
      communities = await invaded.getCommunities();
      expect(communities.length).to.be.equal(1);
      await invaded.updateCommunity(community2.address, "");
      communities = await invaded.getCommunities();
      expect(communities.length).to.be.equal(0);
    });
  });

  describe("TokenMetadata", function () {
    beforeEach(async () => {
      await invaded.updateTokenMetadata([], invader.address);
    });
    it("Tracks are rendered", async function () {
      await invaded.message("nowar", false);
      const token = await invaded.tokenURI(2);
      const json = JSON.parse(token.substring(27));
    });
    it("Random angle is received", async function () {
      const angle = await invader.getAngle();
      expect(angle.toNumber()).to.be.lessThanOrEqual(360);
    });
    it("TokenId is available for owner", async function () {
      await invaded.message("nowar", false);
      expect(await invaded.getYourTokenId()).to.be.equal(2);
    });
    it("TokenId is not available for non-owner", async function () {
      await invaded.message("nowar", false);
      expect(await invaded.connect(addr1).getYourTokenId()).to.be.equal(0);
    });
  });
  // You can nest describe calls to create subsections.
  describe("Message", function () {
    beforeEach(async () => {
      await invaded.updateTokenMetadata([], invader.address);
    });
    it("Can't message twice", async function () {
      await invaded.message("nowar", false);
      await expect(invaded.message("nowar", false)).to.be.revertedWith(
        "You have already sent a message"
      );
    });

    it("Can message duplicate (initial)", async function () {
      await invaded.message("nowar", false);
      expect(await invaded.connect(addr1).message("nowar", false)).to.be.ok;
    });

    it("Can message duplicate (later)", async function () {
      await invaded.setUniqueMessagesOnly(true);
      await invaded.message("nowar", false);
      await expect(
        invaded.connect(addr1).message("nowar", false)
      ).to.be.revertedWith("Message already exists");
      await invaded.setUniqueMessagesOnly(false);
      expect(await invaded.connect(addr1).message("nowar", false)).to.be.ok;
    });

    it("Can't message duplicate (initial)", async function () {
      await invaded.setUniqueMessagesOnly(true);
      await invaded.message("nowar", false);
      await expect(
        invaded.connect(addr1).message("nowar", false)
      ).to.be.revertedWith("Message already exists");
    });

    it("Can't message duplicate (later)", async function () {
      await invaded.message("nowar", false);
      expect(await invaded.connect(addr1).message("nowar", false)).to.be.ok;
      await invaded.setUniqueMessagesOnly(true);

      await expect(
        invaded.connect(addr2).message("nowar", false)
      ).to.be.revertedWith("Message already exists");
    });

    it("Invalid char: #", async function () {
      await expect(invaded.message("#nowar", false)).to.be.revertedWith(
        "Invalid character"
      );
    });

    it("Multiple spaces", async function () {
      await expect(invaded.message("nowar  dffd", false)).to.be.revertedWith(
        "Cannot have multiple sequential spaces"
      );
    });

    it("Message too long", async function () {
      await invaded.message(
        "nowar dffd dfsdfsdf sdfdsfsd sdfsdfsd sdfsdfsd sdfdsfsd sdfsdfsd sdfsdfs",
        false
      );
      await expect(
        invaded
          .connect(addr1)
          .message(
            "nowar dffd dfsdfsdf sdfdsfsd sdfsdfsd sdfsdfsd sdfdsfsd sdfsdfsd sdfsdfs1",
            false
          )
      ).to.be.revertedWith("Message too long");
    });
  });
  describe("Balance", () => {
    beforeEach(async () => {
      await invaded.updateTokenMetadata([], invader.address);
    });
    it("balanceOf=1", async () => {
      await invaded.message("nowar", false, {
        value: ethers.utils.parseEther("1"),
      });
      expect(await invaded.balanceOf(owner.address)).to.equal(1);
    });

    it("owner can withdraw", async () => {
      await invaded.message("nowar", false, {
        value: ethers.utils.parseEther("1"),
      });
      //yes, withdraw is quite special
      //it, unlike other functions, it can force a transaction so it needs to know if who is calling
      //therefore it requires that you sign your function call/tranaction message
      //const tx = await marketplace.methods.withdrawBalance().send({from: _address, gas:1000000}); // , gasPrice:web3.utils.toWei("100", "gwei")});
      expect(await invaded.withdrawAll()).to.be.ok;
    });

    it("admin can withdraw", async () => {
      await invaded.message("nowar", true, {
        value: ethers.utils.parseEther("1"),
      });
      await invaded.connect(addr1).message("nowarqqq", true, {
        value: ethers.utils.parseEther("9"),
      });
      await expect(invaded.connect(addr2).withdrawAll()).to.be.reverted;

      await invaded.approveAdmin(addr2.address);
      await expect(invaded.connect(addr2).withdrawAll()).to.be.ok;
    });

    it("withdraw 100-0", async () => {
      const delta = 2400000;
      const amount = ethers.utils.parseEther("1");
      await invaded.message("nowar", false, {
        value: amount,
      });
      await invaded.approveAdmin(addr2.address);

      const before1 = await owner.getBalance();
      const before = await addr1.getBalance();
      //https://github.com/NomicFoundation/hardhat/issues/1020
      const contractBalance = await ethers.provider.getBalance(invaded.address);
      expect(contractBalance).to.equal(amount);
      const txn = await invaded.connect(addr2).withdrawAll();
      const tx = await txn.wait();
      expect(await ethers.provider.getBalance(invaded.address)).to.equal(0);
      const after = await addr1.getBalance();
      const after1 = await owner.getBalance();
      expect(after - before - amount).to.be.closeTo(0, delta);
      expect(after1 - before1).to.be.equal(0);
    });

    [
      ethers.utils.parseEther("0.001"),
      ethers.utils.parseEther("0.01"),
      ethers.utils.parseEther("0.1"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("10"),
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("1000"),
    ].forEach((amount) => {
      it(`withdraw 10-90 ${amount}`, async () => {
        const delta = 2400000;
        await invaded.message("nowar", true, {
          value: amount,
        });
        await invaded.approveAdmin(addr2.address);

        const before1 = await owner.getBalance();
        const before = await addr1.getBalance();
        //https://github.com/NomicFoundation/hardhat/issues/1020
        const contractBalance = await ethers.provider.getBalance(
          invaded.address
        );
        expect(contractBalance).to.equal(amount);
        const txn = await invaded.connect(addr2).withdrawAll();
        const tx = await txn.wait();
        expect(await ethers.provider.getBalance(invaded.address)).to.equal(0);
        const after = await addr1.getBalance();
        const after1 = await owner.getBalance();
        expect(after - before - amount * 0.9).to.be.closeTo(0, delta);
        expect(after1 - before1 - amount * 0.1).to.be.closeTo(0, delta);
      });
    });

    [
      ethers.utils.parseEther("0.001"),
      ethers.utils.parseEther("0.01"),
      ethers.utils.parseEther("0.1"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("10"),
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("1000"),
    ].forEach((amount) => {
      it(`withdraw 0-100 ${amount}`, async () => {
        const delta = 2400000;
        await invaded.message("nowar", false, {
          value: amount,
        });
        await invaded.approveAdmin(addr2.address);

        const before1 = await owner.getBalance();
        const before = await addr1.getBalance();
        //https://github.com/NomicFoundation/hardhat/issues/1020
        const contractBalance = await ethers.provider.getBalance(
          invaded.address
        );
        expect(contractBalance).to.equal(amount);
        const txn = await invaded.connect(addr2).withdrawAll();
        const tx = await txn.wait();
        expect(await ethers.provider.getBalance(invaded.address)).to.equal(0);
        const after = await addr1.getBalance();
        const after1 = await owner.getBalance();
        expect(after - before - amount).to.be.closeTo(0, delta);
        expect(after1 - before1).to.be.closeTo(0, delta);
      });
    });

    [
      ethers.utils.parseEther("0.001"),
      ethers.utils.parseEther("0.01"),
      ethers.utils.parseEther("0.1"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("10"),
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("1000"),
    ].forEach((amount) => {
      it(`withdraw 5-95 ${amount}`, async () => {
        const delta = 2400000;
        await invaded.message("nowar", false, {
          value: amount,
        });
        await invaded.connect(addr3).message("n-owar", true, {
          value: amount,
        });
        await invaded.approveAdmin(addr2.address);

        const before1 = await owner.getBalance();
        const before = await addr1.getBalance();
        //https://github.com/NomicFoundation/hardhat/issues/1020
        const contractBalance = await ethers.provider.getBalance(
          invaded.address
        );
        expect(contractBalance).to.equal(amount.mul(2));
        const txn = await invaded.connect(addr2).withdrawAll();
        const tx = await txn.wait();
        expect(await ethers.provider.getBalance(invaded.address)).to.equal(0);
        const after = await addr1.getBalance();
        const after1 = await owner.getBalance();
        expect(after - before - amount.mul(2) * 0.95).to.be.closeTo(0, delta);
        expect(after1 - before1 - amount.mul(2) * 0.05).to.be.closeTo(0, delta);
      });
    });

    [
      ethers.utils.parseEther("0.001"),
      ethers.utils.parseEther("0.01"),
      ethers.utils.parseEther("0.1"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("10"),
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("1000"),
    ].forEach((amount) => {
      it(`withdraw 1+1/10*0.9 ${amount}`, async () => {
        const delta = 2400000;
        await invaded.message("nowar", false, {
          value: amount,
        });
        await invaded.connect(addr3).message("n-owar", true, {
          value: amount.div(10),
        });
        await invaded.approveAdmin(addr2.address);

        const before1 = await owner.getBalance();
        const before = await addr1.getBalance();
        //https://github.com/NomicFoundation/hardhat/issues/1020
        const contractBalance = await ethers.provider.getBalance(
          invaded.address
        );
        expect(contractBalance).to.equal(amount.add(amount.div(10)));
        const txn = await invaded.connect(addr2).withdrawAll();
        const tx = await txn.wait();
        expect(await ethers.provider.getBalance(invaded.address)).to.equal(0);
        const after = await addr1.getBalance();
        const after1 = await owner.getBalance();

        const res1 = after
          .sub(before)
          .sub(amount.add(amount.div(10).mul(9).div(10)));

        expect(ethers.utils.formatEther(res1)).to.equal("0.0");
        const res2 = after1.sub(before1).sub(amount.div(100));
        expect(ethers.utils.formatEther(res2)).to.equal("0.0");
      });
    });
  });
});
