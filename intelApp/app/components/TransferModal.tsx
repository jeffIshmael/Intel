"use client";
import { useState, useEffect } from "react";
import { FaExchangeAlt, FaTimes } from "react-icons/fa";
import { toast } from "sonner";

import QRCode from "./QRCode";
import { updateAIBalance } from "@/lib/functions";

export default function TransferModal({
  balance,
  aiBalance,
  address,
  userId,
  poolSpec,
  stake,
  isFetching,
}: {
  balance: number;
  aiBalance: number;
  address: string;
  userId: string;
  poolSpec: string;
  stake: (amount: number, pool: string) => Promise<void>;
  isFetching: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [transferType, setTransferType] = useState<"toAI" | "fromAI">("toAI");
  const [qrOpen, setQrOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Automatically stake if AI balance is positive
    if (aiBalance > 0) {
      toast.info("AI balance is positive. Staking funds...");
      stake(aiBalance, poolSpec);
    }
  }, [aiBalance, stake, poolSpec]); // Runs whenever aiBalance changes

  const handleTransfer = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      toast.info(
        `Transferring ${amount} cUSD ${
          transferType === "toAI" ? "to" : "from"
        } AI Wallet`
      );

      // Simulate transfer
      if (transferType === "toAI") {
        const result = await updateAIBalance(
          Number(userId),
          BigInt(Number(amount) * 10 ** 18),
          false
        );
        console.log(result);
        if (result) {
          toast.success(`Transferred ${amount} cUSD to AI Wallet`);
        }
        // Calling stake function after transfer
        await stake(Number(amount), poolSpec);
        await updateAIBalance(
          Number(userId),
          BigInt(Number(amount) * 10 ** 18),
          true
        );
      } else {
        const result = await updateAIBalance(
          Number(userId),
          BigInt(Number(amount) * 10 ** 18),
          true
        );
        console.log(result);
        if (result) {
          toast.success(`Withdrawing ${amount} cUSD from AI Wallet`);
        }
      }

      // Closing modal after transfer
      setIsModalOpen(false);
      setLoading(false);
      setAmount("");
    } catch (error) {
      console.log(error);
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
            {isFetching ? (
              <div className="bg-gray-200 h-2 w-12 rounded-lg opacity-50 animate-pulse"></div>
            ) : Number.isNaN(balance) ? (
              "--"
            ) : (
              aiBalance
            )}{" "}
            cUSD
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
            {isFetching ? (
              <div className="bg-gray-200 h-2 w-12 rounded-lg opacity-50 animate-pulse"></div>
            ) : Number.isNaN(balance) ? (
              "--"
            ) : (
              aiBalance
            )}{" "}
            cUSD
          </p>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <button
          className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg mr-2 transition"
          onClick={() => setQrOpen(true)}
          disabled={isFetching}
        >
          Deposit
        </button>
        <button
          onClick={() => toast.info("Still under development")}
          disabled={isFetching}
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
              onClick={handleTransfer}
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
