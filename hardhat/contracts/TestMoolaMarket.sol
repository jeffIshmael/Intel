// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TestMoolaMarket {
    IERC20 public token;
    
    constructor(address _token) {
        token = IERC20(_token);
    }

    function deposit(address asset, uint256 amount, address, uint16) external {
        // Transfer tokens from caller to this contract
        require(IERC20(asset) == token, "Wrong token");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    function withdraw(address asset, uint256 amount, address to) external {
        require(IERC20(asset) == token, "Wrong token");
        require(token.transfer(to, amount), "Transfer failed");
    }
}