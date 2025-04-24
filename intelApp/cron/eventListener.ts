// cron/eventListener.ts
"use server";

const { createPublicClient, http } = require("viem");
const { celo } = require("viem/chains");
const {
  intelContractAddress,
  intelAbi,
} = require("@/Blockchain/intelContract");
const { agentStakeToPool } = require("@/lib/aiAgent");
const cron = require("cron");

const publicClient = createPublicClient({
  chain: celo,
  transport: http(),
});

// function to watch for deposits made
async function watchDeposits() {
  let usersAddresses: string[] = [];
  try {
    console.log("Watching for deposits...");
    // Get the latest block number to start watching from
    const latestBlock = await publicClient.getBlockNumber();

    // Set up the event filter
    const depositEvent = {
      address: intelContractAddress,
      event: {
        type: "event",
        name: "Deposited",
        inputs: [
          { type: "address", name: "user", indexed: true },
          { type: "uint256", name: "amount", indexed: false },
        ],
      } as const,
      fromBlock: latestBlock - BigInt(1000), // Look back 100 blocks to catch recent events
      toBlock: "latest",
    };

    // Watch for new events
    const unwatch = publicClient.watchContractEvent({
      address: intelContractAddress,
      abi: intelAbi,
      eventName: "Deposited",
      onLogs: (logs: any) => {
        logs.forEach((log: any) => {
          console.log(`New deposit detected from ${log.args.user}`);
          usersAddresses.push(log.args.user.toString());
        });
      },
    });

     // Trigger the staking function
     agentStakeToPool(usersAddresses).then((txHash: string) => {
      if (txHash) {
        console.log(`Staking triggered successfully: ${txHash}`);
      }
    });

    console.log("Now watching for deposit events...");
    console.log(unwatch);
    return unwatch;
  } catch (error) {
    console.error("Error setting up event listener:", error);
  }
}

// Schedule the function to run every 10 seconds
cron.schedule("*/10 * * * * *", watchDeposits);
