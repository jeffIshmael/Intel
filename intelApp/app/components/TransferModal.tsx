"use client";
import { useState, useEffect } from "react";
import { FaExchangeAlt, FaTimes } from "react-icons/fa";
import { toast } from "sonner";

import QRCode from "./QRCode";
import { sendEmailToAllStakedUsers, updateStakedPool } from "@/lib/functions";
import { sendcUSD } from "@/lib/allfunctions";
import { intelContractAddress } from "@/Blockchain/intelContract";
import { getStake } from "@/lib/TokenTransfer";

export default function TransferModal({
  balance,
  aiBalance,
  address,
  userId,
  poolSpec,
  poolName,
  privKey,
  stake,
}: {
  balance: number;
  aiBalance: number;
  address: string;
  userId: string;
  poolSpec: string;
  poolName: string;
  privKey: string;
  stake: (amount: number, poolSpec: string, poolName: string) => Promise<void>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [transferType, setTransferType] = useState<"toAI" | "fromAI">("toAI");
  const [qrOpen, setQrOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStake, setUserStake] = useState<number | null>(null);

  useEffect(() => {
    // Automatically stake if AI balance is positive
    if (aiBalance > 0) {
      toast.info("AI wallet balance is positive. Staking funds...");
      stake(aiBalance, poolSpec, poolName);
    }
  }, [aiBalance, stake, poolSpec, poolName]); // Runs whenever aiBalance changes

  // const handleTransfer = async () => {
  //   if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
  //     toast.error("Please enter a valid amount.");
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     toast.info(
  //       `Transferring ${amount} cUSD ${
  //         transferType === "toAI" ? "to" : "from"
  //       } AI Wallet`
  //     );

  //     // Simulate transfer
  //     if (transferType === "toAI") {
  //       const result = await updateAIBalance(
  //         Number(userId),
  //         BigInt(Number(amount) * 10 ** 18),
  //         false
  //       );
  //       console.log(result);
  //       if (result) {
  //         toast.success(`Transferred ${amount} cUSD to AI Wallet`);
  //       }
  //       // A new Promise to handle both stake and updateAIBalance operations
  //       const stakingPromise = new Promise((resolve, reject) => {
  //         //  Calling the stake function
  //         stake(Number(amount), poolSpec, poolName)
  //           .then((stakeResult) => {
  //             // After stake succeeds, call updateAIBalance
  //             return updateAIBalance(
  //               Number(userId),
  //               BigInt(Number(amount) * 10 ** 18),
  //               true
  //             ).then((updateResult) => {
  //               // Resolve the Promise with both results
  //               resolve({ stakeResult, updateResult });
  //             });
  //           })
  //           .catch((error) => {
  //             // Reject the Promise if any step fails
  //             reject(error);
  //           });
  //       });

  //       // Use toast.promise to show loading, success, and error states
  //       toast.promise(stakingPromise, {
  //         loading: "Please wait.Intel AI is staking...",
  //         success: "Staking completed successfully!",
  //         error: (err) =>
  //           `Error during staking: ${err.message || "Unknown error"}`,
  //       });
  //     } else {
  //       const result = await updateAIBalance(
  //         Number(userId),
  //         BigInt(Number(amount) * 10 ** 18),
  //         true
  //       );
  //       console.log(result);
  //       if (result) {
  //         toast.success(`Withdrawing ${amount} cUSD from AI Wallet`);
  //       }
  //     }
  //     // Closing modal after transfer
  //     setIsModalOpen(false);
  //     setLoading(false);
  //     setAmount("");
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    const fetchBalance = async () => {
      const stake = await getStake(address);
      setUserStake(Number(stake));
    };
    fetchBalance();
  }, [userStake]);

  //new staking function
  const handleContractStaking = async () => {
    try {
      setLoading(true);
      toast.info(
        `Transferring ${amount} cUSD ${
          transferType === "toAI" ? "to" : "from"
        } AI Wallet`
      );
      const result = await sendcUSD(
        privKey as `0x${string}`,
        intelContractAddress as `0x${string}`,
        Number(amount) * 10 ** 18
      );
      console.log("Sending cUSD tx:", result);
      if (result) {
        const updatePool = await updateStakedPool(
          Number(userId),
          poolSpec,
          BigInt(Number(amount) * 10 ** 18)
        );
        console.log(updatePool);
        toast.success(
          <div className="flex items-center space-x-4">
            {/* Icon for visual appeal */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>

            {/* Main Content */}
            <div>
              <p className="text-sm font-medium text-gray-800">
                <span className="font-mono">
                  Successfully sent to AI wallet.
                  <span>(Intel contract Address)</span>.
                </span>
              </p>
              <p className="text-sm text-gray-600">
                <a
                  href={`https://celoscan.io/tx/${result}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline hover:text-blue-600 transition-colors"
                >
                  Explore on CeloScan
                </a>
              </p>
            </div>
          </div>,
          {
            className: "bg-white shadow-md rounded-lg p-4 max-w-sm",
            style: {
              borderLeft: "4px solid #34C759", // Green border for success
            },
            duration: 5000,
          }
        );
        // trigger the nebula AI to stake to the best pool
        // const transaction = await stakecUSD(
        //   privKey as `0x${string}`,
        //   Number(amount) * 10 ** 18
        // );
        // console.log("Deposit tx:", transaction);
        // const outcome = await sendToStakingPool(
        //   privKey as `0x${string}`,
        //   "0x970b12522CA9b4054807a2c5B736149a5BE6f670"
        // );
        // console.log("Send to staking pool tx:", outcome);
        const emails = await sendEmailToAllStakedUsers();
        toast("An update will be sent to your email.");
        console.log(emails);
      }
    } catch (error) {
      console.log(error);
      toast.error("make sure you have enough cUSD.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Balance</h1>
      <div className="flex items-center justify-between bg-gray-700 p-6 rounded-lg">
        <div className="text-center">
          <h2 className="text-sm font-medium text-gray-400">Wallet</h2>
          <p className="text-lg font-bold">
            {Number.isNaN(balance) ? "--" : balance.toFixed(4)} cUSD
          </p>
        </div>
        <button
          title="Transfer To/From"
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-800 p-3 rounded-full hover:bg-gray-600 transition"
        >
          <FaExchangeAlt className="text-white text-xl" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-medium text-gray-400">AI Wallet</h2>
          <p className="text-lg font-bold">
            {Number.isNaN(Number(userStake))
              ? "--"
              : (Number(userStake) / 10 ** 18).toFixed(4)}{" "}
            cUSD
          </p>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <button
          className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg mr-2 transition"
          onClick={() => setQrOpen(true)}
        >
          Deposit
        </button>
        <button
          onClick={() => toast.info("Withdrawal feature coming soon!")}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg ml-2 transition"
        >
          Withdraw
        </button>
      </div>

      {/* Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Transfer Funds</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <label className="block text-sm text-gray-400 mb-2">
              Amount (cUSD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 mb-4"
              placeholder="Enter amount"
            />

            <label className="block text-sm text-gray-400 mb-2">
              Transfer Type
            </label>
            <select
              value={transferType}
              onChange={(e) =>
                setTransferType(e.target.value as "toAI" | "fromAI")
              }
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 mb-4"
            >
              <option value="toAI">To AI Wallet</option>
              <option value="fromAI">From AI Wallet</option>
            </select>

            <button
              onClick={handleContractStaking}
              className={`w-full bg-blue-600  text-white font-semibold py-2 px-4 rounded-lg transition${
                loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-500"
              }`}
            >
              {loading ? "transferring.." : "Confirm Transfer"}
            </button>
          </div>
        </div>
      )}
      {qrOpen && (
        <QRCode walletAddress={address} onClose={() => setQrOpen(false)} />
      )}
    </div>
  );
}
