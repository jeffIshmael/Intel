const { ethers } = require("hardhat");

async function main() {
  //  constructor arguments
  // 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1 cUSD testnet
    // 0x765DE816845861e75A25fCA122bb6898B8B1282a cUSD mainnet
  const param1 = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // Address of cUSD
  const param2 = "0x4821ced48Fb4456055c86E42587f61c1F39c6315"; // Address of AI Wallet

  // Deploying contract with constructor arguments
  const intel = await ethers.deployContract("Intel", [param1, param2]);

  await intel.waitForDeployment();

  console.log("Intel contract address - " + (await intel.getAddress()));
}

// Error handling
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//moch stakingPool = 0x66BF5390857F4112F671a5B71FEa28eaf579ed99
//testne = 0xbF759c7F342eA07DfBCC8051179A38B4C066C180
//hardhat verification = npx hardhat verify --network alfajores 0xbF759c7F342eA07DfBCC8051179A38B4C066C180 "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" "0x4821ced48Fb4456055c86E42587f61c1F39c6315"