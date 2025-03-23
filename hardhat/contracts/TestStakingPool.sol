// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TestStakingPool {
    function stake(uint256 amount) external {}
    function withdraw(uint256 amount) external {}
    function getRewards(address user) external view returns (uint256) {
        if (user == msg.sender) {
            return 10 ether; 
            } else {
                return 5 ether;
                }
                }
            }
