const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Intel Smart Contract", function () {
  let Intel, intel, owner, user1, user2, aiAgent, stakingPool, cUSD;

  before(async function () {
    [owner, user1, user2, aiAgent, stakingPool] = await ethers.getSigners();

    // Deploy the test ERC20 token
    const testERC = await ethers.getContractFactory("TestERC");
    cUSD = await testERC.deploy("cUSD Token", "cUSD", 18);
    await cUSD.waitForDeployment();

    //deploy test staking pool
    const testStakingPool = await ethers.getContractFactory("TestStakingPool");
    stakingPool = await testStakingPool.deploy();
    await stakingPool.waitForDeployment();

    // Deploy Intel contract
    Intel = await ethers.getContractFactory("Intel");
    intel = await Intel.deploy(cUSD.getAddress(), aiAgent.address);
    await intel.waitForDeployment();
  });

  it("Should deploy with correct initial values", async function () {
    expect(await intel.cUSD()).to.equal(await cUSD.getAddress());
    expect(await intel.aiAgent()).to.equal(aiAgent.address);
  });

  it("Should allow users to deposit funds into the AI wallet", async function () {
    const depositAmount = ethers.parseEther("100");

    // Mint cUSD to user1
    await cUSD.connect(owner).mint(user1.address, depositAmount);
    await cUSD.connect(user1).approve(await intel.getAddress(), depositAmount);

    // Deposit into AI wallet
    await expect(intel.connect(user1).deposit(depositAmount))
      .to.emit(intel, "Deposited")
      .withArgs(user1.address, depositAmount);

    // Check user stake balance
    const userStake = await intel.userStakes(user1.address);
    expect(userStake.amount).to.equal(depositAmount);
  });

  it("Should allow AI to stake funds in a pool", async function () {
    await expect(intel.connect(aiAgent).stakeInBestPool(await stakingPool.getAddress()))
      .to.emit(intel, "Staked")
      .withArgs(await stakingPool.getAddress(), ethers.parseEther("100"));
  });
  

  it("Should allow users to withdraw their rewards", async function () {
    // Mock rewards in the staking pool
    await intel
      .connect(aiAgent)
      .stakeInBestPool(await stakingPool.getAddress());

    await expect(intel.connect(user1).claimRewards())
      .to.emit(intel, "RewardsClaimed")
      .withArgs(user1.address, ethers.parseEther("10"));
  });
});
