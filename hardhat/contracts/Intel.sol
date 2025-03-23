// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IStakingPool {
    function stake(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getRewards(address user) external view returns (uint256);
}

contract Intel is Ownable {
    IERC20 public cUSD;
    address public aiAgent; // Nebula AI agent
    address public stakingPool;

    struct UserStake {
        uint256 amount;
        uint256 rewards;
    }
    mapping(address => UserStake) public userStakes;
    uint256 public totalStaked;

    event Deposited(address indexed user, uint256 amount);
    event Staked(address indexed pool, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _cUSD, address _aiAgent) Ownable(msg.sender) {
        cUSD = IERC20(_cUSD);
        aiAgent = _aiAgent;
    }

    modifier onlyAIAgent() {
        require(msg.sender == aiAgent, "Only AI Agent can call this");
        _;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Cannot deposit 0");
        cUSD.transferFrom(msg.sender, address(this), amount);
        userStakes[msg.sender].amount += amount;
        totalStaked += amount;
        emit Deposited(msg.sender, amount);
    }

    function stakeInBestPool(address _stakingPool) external onlyAIAgent {
        require(totalStaked > 0, "No funds to stake");
        stakingPool = _stakingPool;
        cUSD.approve(stakingPool, totalStaked);
        IStakingPool(stakingPool).stake(totalStaked);
        emit Staked(stakingPool, totalStaked);
    }

    function withdraw(uint256 amount) external {
        require(userStakes[msg.sender].amount >= amount, "Not enough balance");
        IStakingPool(stakingPool).withdraw(amount);
        cUSD.transfer(msg.sender, amount);
        userStakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        emit Withdrawn(msg.sender, amount);
    }

    function claimRewards() external {
        uint256 rewards = IStakingPool(stakingPool).getRewards(address(this));
        uint256 userShare = (rewards * userStakes[msg.sender].amount) / totalStaked;
        require(userShare > 0, "No rewards available");
        cUSD.transfer(msg.sender, userShare);
        emit RewardsClaimed(msg.sender, userShare);
    }
}
