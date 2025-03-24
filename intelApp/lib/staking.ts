import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://forno.celo.org"); // Celo RPC URL
const privateKey = "YOUR_PRIVATE_KEY"; // use actual private key
const signer = new ethers.Wallet(privateKey, provider);

const approveCUSD = async (amount: number) => {
  console.log("Approving cUSD...");

  const cUSD = new ethers.Contract(
    "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD Contract Address
    [
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function allowance(address owner, address spender) external view returns (uint256)",
      "function balanceOf(address owner) external view returns (uint256)",
    ],
    signer
  );

  const parsedAmount = ethers.parseUnits(amount.toString(), 18);

  // Check balance
  const balance = await cUSD.balanceOf(signer.address);
  if (balance < parsedAmount) {
    throw new Error("Insufficient cUSD balance");
  }

  // Approve transaction
  const tx = await cUSD.approve(
    "0x970b12522CA9b4054807a2c5B736149a5BE6f670", // Moola Market Proxy
    parsedAmount
  );
  await tx.wait();

  console.log("cUSD Approved!");

  // Verify allowance
  const allowance = await cUSD.allowance(
    signer.address,
    "0x970b12522CA9b4054807a2c5B736149a5BE6f670"
  );
  if (allowance < parsedAmount) {
    throw new Error("Approval failed, allowance insufficient");
  }
};

const stakeCUSD = async (amount: number) => {
  console.log("Staking in Moola...");

  const moolaMarket = new ethers.Contract(
    "0x970b12522CA9b4054807a2c5B736149a5BE6f670", // Moola Market Proxy
    ["function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external"],
    signer
  );

  const parsedAmount = ethers.parseUnits(amount.toString(), 18);

  // Estimate gas (optional)
  const gasEstimate = await moolaMarket.deposit.estimateGas(
    "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD Address
    parsedAmount,
    signer.address,
    0
  );

  console.log(`Estimated Gas: ${gasEstimate.toString()}`);

  // Send the transaction
  const tx = await moolaMarket.deposit(
    "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD Address
    parsedAmount,
    signer.address, // onBehalfOf
    0, // referralCode
    { gasLimit: gasEstimate }
  );

  const txFull = await tx.wait();
  console.log("Staked in Moola Market!", txFull);
  return txFull;
};

const handleStake = async (amount: number) => {
  try {
    await approveCUSD(amount);
    const result = await stakeCUSD(amount);
    console.log(result);
  } catch (error) {
    console.error("Staking failed:", error);
  }
};


