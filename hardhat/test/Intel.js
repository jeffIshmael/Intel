const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Intel Smart Contract", function () {
  let Intel, intel, owner, user1, user2, aiAgent, stakingPool, cUSD;

  before(async function () {
    [owner, user1, user2, aiAgent, stakingPool] = await ethers.getSigners();

    // Deploy test ERC20 token (cUSD)
    const TestERC = await ethers.getContractFactory("TestERC");
    cUSD = await TestERC.deploy("cUSD Token", "cUSD", 18);
    await cUSD.waitForDeployment();

    // Deploy test staking pool
    const TestStakingPool = await ethers.getContractFactory("TestStakingPool");
    stakingPool = await TestStakingPool.deploy();
    await stakingPool.waitForDeployment();

    // Deploy Intel contract
    Intel = await ethers.getContractFactory("Intel");
    intel = await Intel.deploy(await cUSD.getAddress(), aiAgent.address);
    await intel.waitForDeployment();
  });

  it("Should deploy with correct initial values", async function () {
    expect(await intel.cUSD()).to.equal(await cUSD.getAddress());
    expect(await intel.aiAgent()).to.equal(aiAgent.address);
  });

  it("Should allow users to deposit funds", async function () {
    const depositAmount = ethers.parseEther("100");
    console.log("Deposit Amount:", depositAmount.toString());

    // Mint cUSD to user1
    await cUSD.connect(owner).mint(user1.address, depositAmount);
    await cUSD.connect(user1).approve(await intel.getAddress(), depositAmount);

    // Deposit into Intel contract
    const tx = await intel.connect(user1).deposit(depositAmount);
    await tx.wait();

    // Fetch user stake balance
    const userStake = await intel.userStakes(user1.address);
    if (!userStake || userStake.amount === undefined) {
      console.error("Error: userStake is undefined");
    } else {
      console.log("User Stake Amount:", userStake.amount.toString()); // Debugging log
    }
    expect(userStake.amount).to.equal(depositAmount);
  });

  it("Should allow AI agent to stake funds in a pool", async function () {
    const depositAmount = ethers.parseEther("100");

    // Ensure staking pool balance before staking
    const totalStakedBefore = await intel.totalStaked();
    expect(totalStakedBefore).to.equal(depositAmount);

    await expect(
      intel.connect(aiAgent).stakeInBestPool(await stakingPool.getAddress())
    )
      .to.emit(intel, "Staked")
      .withArgs(await stakingPool.getAddress(), depositAmount);
  });

  it("Should allow users to withdraw their deposits", async function () {
    const withdrawAmount = ethers.parseEther("50");
    console.log("Withdraw Amount:", withdrawAmount.toString()); // Debugging log

    // Ensure user has enough balance before withdrawal
    const userStakeBefore = await intel.userStakes(user1.address);
    console.log("User Stake Before:", userStakeBefore.amount.toString());

    await expect(intel.connect(user1).withdraw(withdrawAmount))
      .to.emit(intel, "Withdrawn")
      .withArgs(user1.address, withdrawAmount);

    // Fetch updated user stake balance
    const userStakeAfter = await intel.userStakes(user1.address);
    console.log("User Stake After:", userStakeAfter.amount.toString());

    expect(userStakeAfter.amount).to.equal(ethers.parseEther("50"));
  });

  it("Should allow users to check their rewards", async function () {
    const rewards = await intel.getUserRewards(user1.address);
    expect(rewards).to.be.a("bigint"); // Ensure rewards return a BigInt
  });

  it("Should allow owner to update AI agent and staking pool", async function () {
    await expect(intel.connect(owner).setAIAgent(user2.address))
      .to.emit(intel, "AIAgentUpdated")
      .withArgs(user2.address);

    await expect(
      intel.connect(owner).setStakingPool(await stakingPool.getAddress())
    )
      .to.emit(intel, "StakingPoolUpdated")
      .withArgs(await stakingPool.getAddress());
  });

  it("Should allow the owner to pause and unpause the contract", async function () {
    await expect(intel.connect(owner).pause())
      .to.emit(intel, "Paused")
      .withArgs(owner.address);

    await expect(intel.connect(owner).unpause())
      .to.emit(intel, "Unpaused")
      .withArgs(owner.address);
  });
});
