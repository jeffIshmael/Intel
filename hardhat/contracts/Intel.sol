// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IStakingPool {
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getRewards(address user) external view returns (uint256);
}

interface IMoolaMarket {
    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external;
}

contract Intel is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public cUSD;
    address public aiAgent;
    address public stakingPool;
    address public moolaMarketProxy;

    struct UserStake {
        uint256 amount;
        uint256 timestamp;
    }
    mapping(address => UserStake) public userStakes;
    uint256 public totalStaked;
    uint256 public contractUnstakedBalance; // Tracks the unstaked balance in the contract

    event Deposited(address indexed user, uint256 amount);
    event Staked(address indexed pool, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event AIAgentUpdated(address indexed newAIAgent);
    event StakingPoolUpdated(address indexed newStakingPool);
    event CUSDUpdated(address indexed newCUSD);
    event MoolaMarketProxyUpdated(address indexed newMoolaMarketProxy);

    constructor(address _cUSD, address _aiAgent, address _moolaMarketProxy) Ownable(msg.sender) {
        require(_cUSD != address(0), "Invalid cUSD address");
        require(_aiAgent != address(0), "Invalid AI agent address");
        require(_moolaMarketProxy != address(0), "Invalid Moola Market proxy address");
        cUSD = IERC20(_cUSD);
        aiAgent = _aiAgent;
        moolaMarketProxy = _moolaMarketProxy;
    }

    modifier onlyAIAgent() {
        require(msg.sender == aiAgent, "Only AI Agent can call this");
        _;
    }

    /**
     * @notice Allows a user to deposit cUSD and updates the unstaked balance.
     */
    function deposit(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Cannot deposit 0");

        // Update user's stake
        if (userStakes[msg.sender].amount == 0) {
            userStakes[msg.sender] = UserStake(amount, block.timestamp);
        } else {
            userStakes[msg.sender].amount += amount;
        }

        // Update total staked amount and unstaked balance
        totalStaked += amount;
        contractUnstakedBalance += amount;

        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Allows the AI agent to stake the unstaked balance in the best pool.
     */
    function stakeInBestPool(address _stakingPool) external onlyAIAgent {
        require(_stakingPool != address(0), "Invalid staking pool address");
        require(contractUnstakedBalance > 0, "No unstaked funds to stake");

        // Update the staking pool address
        stakingPool = _stakingPool;

        // Stake the unstaked balance in the new pool
        uint256 amountToStake = contractUnstakedBalance;
        cUSD.safeIncreaseAllowance(stakingPool, amountToStake);

        // Stake in Moola Market
        IMoolaMarket(moolaMarketProxy).deposit(
            address(cUSD), // cUSD address
            amountToStake, // Amount to stake
            address(this), // onBehalfOf (your contract)
            0              // referralCode
        );

        // Reset the unstaked balance
        contractUnstakedBalance = 0;

        emit Staked(stakingPool, amountToStake);
    }

    /**
     * @notice Allows a user to withdraw their staked funds.
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than zero");
        require(userStakes[msg.sender].amount >= amount, "Not enough balance");
        require(stakingPool != address(0), "Staking pool not set");

        // Update user's stake and total staked amount
        userStakes[msg.sender].amount -= amount;
        totalStaked -= amount;

        // Withdraw from Moola Market
        IMoolaMarket(moolaMarketProxy).withdraw(
            address(cUSD), // cUSD address
            amount,        // Amount to withdraw
            msg.sender     // Address to receive the funds
        );

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Updates the AI agent address.
     */
    function setAIAgent(address _aiAgent) external onlyOwner {
        require(_aiAgent != address(0), "Invalid AI agent address");
        aiAgent = _aiAgent;
        emit AIAgentUpdated(_aiAgent);
    }

    /**
     * @notice Updates the staking pool address.
     */
    function setStakingPool(address _stakingPool) external onlyOwner {
        require(_stakingPool != address(0), "Invalid staking pool address");
        stakingPool = _stakingPool;
        emit StakingPoolUpdated(_stakingPool);
    }

    /**
     * @notice Updates the cUSD token address.
     */
    function setCUSD(address _cUSD) external onlyOwner {
        require(_cUSD != address(0), "Invalid cUSD address");
        cUSD = IERC20(_cUSD);
        emit CUSDUpdated(_cUSD);
    }

    /**
     * @notice Updates the Moola Market proxy address.
     */
    function setMoolaMarketProxy(address _moolaMarketProxy) external onlyOwner {
        require(_moolaMarketProxy != address(0), "Invalid Moola Market proxy address");
        moolaMarketProxy = _moolaMarketProxy;
        emit MoolaMarketProxyUpdated(_moolaMarketProxy);
    }

    /**
     * @notice Pauses the contract.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses the contract.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Recovers ERC20 tokens accidentally sent to the contract.
     */
    function recoverERC20(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(cUSD), "Cannot recover cUSD");
        IERC20(tokenAddress).safeTransfer(owner(), amount);
    }

    /**
     * @notice Retrieves the rewards earned by a user in the staking pool.
     */
    function getUserRewards(address user) external view returns (uint256) {
        return IStakingPool(stakingPool).getRewards(user);
    }

    //function to get user stake
     function getUserStake(address user) external view returns (uint256 amount) {
        return userStakes[user].amount;
    }
}