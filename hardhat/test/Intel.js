const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Intel Contract", function () {
  let Intel, intel;
  let TestERC, cUSD;
  let stakingPool, moolaMarket;
  let owner, aiAgent, user1, user2;

  before(async function () {
    [owner, aiAgent, user1, user2] = await ethers.getSigners();

    // Deploy mock cUSD token
    TestERC = await ethers.getContractFactory("TestERC");
    cUSD = await TestERC.deploy("cUSD Token", "cUSD", 18);
    await cUSD.waitForDeployment();

    // Deploy mock Moola Market
    const TestMoolaMarket = await ethers.getContractFactory("TestMoolaMarket");
    moolaMarket = await TestMoolaMarket.deploy(await cUSD.getAddress());
    await moolaMarket.waitForDeployment();

    // Deploy mock staking pool
    const TestStakingPool = await ethers.getContractFactory("TestStakingPool");
    stakingPool = await TestStakingPool.deploy();
    await stakingPool.waitForDeployment();

    // Deploy Intel contract
    Intel = await ethers.getContractFactory("Intel");
    intel = await Intel.deploy(
      await cUSD.getAddress(),
      aiAgent.address,
      await moolaMarket.getAddress()
    );
    await intel.waitForDeployment();
  });

  describe("Initial Setup", function () {
    it("Should set the right owner", async function () {
      expect(await intel.owner()).to.equal(owner.address);
    });

    it("Should set the correct cUSD token address", async function () {
      expect(await intel.cUSD()).to.equal(await cUSD.getAddress());
    });

    it("Should set the correct AI agent address", async function () {
      expect(await intel.aiAgent()).to.equal(aiAgent.address);
    });

    it("Should set the correct Moola Market proxy address", async function () {
      expect(await intel.moolaMarketProxy()).to.equal(
        await moolaMarket.getAddress()
      );
    });
  });

  describe("Deposit Functionality", function () {
    const depositAmount = ethers.parseEther("100");

    beforeEach(async function () {
      await cUSD.connect(owner).mint(user1.address, depositAmount);
    });

 
    it("Should reject zero amount deposits", async function () {
      await expect(intel.connect(user1).deposit(0)).to.be.revertedWith(
        "Cannot deposit 0"
      );
    });
  });

  describe("Staking Functionality", function () {
    const depositAmount = ethers.parseEther("100");

    it("Should reject staking by non-AI agent", async function () {
      await expect(
        intel.connect(user1).stakeInBestPool(await stakingPool.getAddress())
      ).to.be.revertedWith("Only AI Agent can call this");
    });
  });

  describe("Withdrawal Functionality", function () {
    const depositAmount = ethers.parseEther("100");
    const withdrawAmount = ethers.parseEther("50");

    beforeEach(async function () {
      await cUSD.connect(owner).mint(user1.address, depositAmount);
      await cUSD
        .connect(user1)
        .approve(await intel.getAddress(), depositAmount);
      await intel.connect(user1).deposit(depositAmount);
      await intel
        .connect(aiAgent)
        .stakeInBestPool(await stakingPool.getAddress());
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update AI agent", async function () {
      await expect(intel.connect(owner).setAIAgent(user2.address))
        .to.emit(intel, "AIAgentUpdated")
        .withArgs(user2.address);
    });

    it("Should prevent non-owners from updating AI agent", async function () {
      await expect(
        intel.connect(user1).setAIAgent(user1.address)
      ).to.be.revertedWithCustomError(intel, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to recover ERC20 tokens", async function () {
      const TestERC = await ethers.getContractFactory("TestERC");
      const testToken = await TestERC.deploy("Test Token", "TEST", 18);
      await testToken.waitForDeployment();

      await testToken.connect(owner).mint(await intel.getAddress(), 1000);
      await expect(
        intel.connect(owner).recoverERC20(await testToken.getAddress(), 1000)
      ).to.changeTokenBalance(testToken, owner, 1000);
    });
  });
});
