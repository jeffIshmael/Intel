const { ethers } = require("hardhat");

async function main() {
  //  constructor arguments
  // 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1 cUSD testnet
    // 0x765DE816845861e75A25fCA122bb6898B8B1282a cUSD mainnet
  const cUSDAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a"; // Address of cUSD
  const AIWallet = "0x4821ced48Fb4456055c86E42587f61c1F39c6315"; // Address of AI Wallet
  const stakingPool = "0x970b12522CA9b4054807a2c5B736149a5BE6f670";
  // Deploying contract with constructor arguments
  const intel = await ethers.deployContract("Intel", [cUSDAddress, AIWallet, stakingPool]);

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
//mainnet = 0x5CFE907EDFbD492cf1C4D8Be6D41cF2E4C5bc2B8
//latest = 0xe84fEB45B8ea5292706667777c6DBBC521a149B9
//latest1 = 0xD7aE88397fB1c944dE3d8B291b3AeaBf73398CdD
//latest2= 0x95DEca6A1604A4D3aB29332AD26fc0caF0dE15FA
//hardhat verification = npx hardhat verify --network celo 0x5CFE907EDFbD492cf1C4D8Be6D41cF2E4C5bc2B8 "0x765DE816845861e75A25fCA122bb6898B8B1282a" "0x4821ced48Fb4456055c86E42587f61c1F39c6315"