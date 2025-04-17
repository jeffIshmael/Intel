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

// deploying - npx hhardhat run scripts/deploy.js --network celo
// veryfying - npx hardhat verify --network celo 0x137d84aF92BC35b9C2362dA9DD34b561b339cAf5 "0x765DE816845861e75A25fCA122bb6898B8B1282a" "0x4821ced48Fb4456055c86E42587f61c1F39c6315" "0x970b12522CA9b4054807a2c5B736149a5BE6f670"