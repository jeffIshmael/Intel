"use client";
import { useState, useEffect } from "react";
import { FaExchangeAlt, FaTimes, FaArrowRight, FaQrcode } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import QRCode from "./QRCode";
import { sendConfirmationEmail } from "@/lib/functions";
import { getBalance, sendcUSD, stakecUSD } from "@/lib/allfunctions";
import { intelContractAddress } from "@/Blockchain/intelContract";
import { getStake } from "@/lib/TokenTransfer";
import Withdraw from "./Withdraw";

export default function TransferModal({
  address,
  userId,
  privKey,

}: {
  address: string;
  userId: string;
  privKey: string;

}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [transferType, setTransferType] = useState<"toAI" | "fromAI">("toAI");
  const [qrOpen, setQrOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStake, setUserStake] = useState<number | null>(null);
  const [userBalance, setUserBalance] = useState<number | null>(null);

  //getting realtime balance and ai balance
  const getUserBalance = async () => {
    try {
      const [walletBalance, aiBalance] = await Promise.all([
        getBalance(address as `0x${string}`),
        getStake(address),
      ]);
      setUserBalance(Number(walletBalance));
      setUserStake(Number(aiBalance));
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  useEffect(() => {
    getUserBalance();
  }, [address, userBalance, userStake]);

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

      if (result) {
        const hash = await stakecUSD(
          privKey as `0x${string}`,
          Number(amount) * 10 ** 18
        );

        if (hash) {
          toast.success(
            <div className="flex items-start">
              <div className="flex-1">
                <p className="font-medium">Transfer successful!</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {amount} cUSD transferred to AI Wallet
                </p>
                <a
                  href={`https://celoscan.io/tx/${result}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-500 hover:underline mt-1 text-sm"
                >
                  View transaction <FiExternalLink className="ml-1" />
                </a>
              </div>
            </div>,
            {
              duration: 5000,
            }
          );

          await sendConfirmationEmail(Number(userId), amount);
          toast.info("Updates will be sent to your email");
          await getUserBalance();
          setIsModalOpen(false);
          setAmount("");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Transaction failed. Please ensure you have enough cUSD.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-2 rounded-2xl shadow-xl w-full max-w-md mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-900">
        <h1 className="text-xl font-bold text-white">Wallet Balances</h1>
        <p className="text-sm text-gray-400 mt-1">
          Transfer between your wallets
        </p>
      </div>

      {/* Balances */}
      <div className="p-4">
        <div className="flex items-center justify-between bg-gray-700 p-5 rounded-xl">
          <div className="text-center">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Your Wallet
            </h2>
            <p className="text-xl font-bold text-white mt-1">
              {Number.isNaN(userBalance) ? "--" : userBalance?.toFixed(4)} cUSD
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-all duration-200 hover:rotate-90"
            aria-label="Transfer funds"
          >
            <FaExchangeAlt className="text-white text-lg" />
          </button>

          <div className="text-center">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              AI Wallet
            </h2>
            <p className="text-xl font-bold text-white mt-1">
              {Number.isNaN(Number(userStake))
                ? "--"
                : (Number(userStake) / 10 ** 18).toFixed(4)}{" "}
              cUSD
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setQrOpen(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center"
          >
            <FaQrcode className="mr-2" /> Deposit
          </button>
          <Withdraw privateKey={privKey} balance={userBalance ?? 0} />
        </div>
      </div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -20, scale: 0.98 }}
              className="relative bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Transfer Funds
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Amount (cUSD)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                    />
                    <p className="text-sm text-gray-300 mt-2 mr-0 flex justify-end ">
                      Available Balance:{" "}
                      {transferType === "toAI"
                        ? userBalance?.toFixed(4)
                        : (Number(userStake) / 10 ** 18).toFixed(4)}{" "}
                      cUSD
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Transfer Direction
                    </label>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setTransferType("toAI")}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                          transferType === "toAI"
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        To AI Wallet
                      </button>
                      <button
                        onClick={() => setTransferType("fromAI")}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                          transferType === "fromAI"
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        From AI Wallet
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleContractStaking}
                    disabled={loading || !amount}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                      loading
                        ? "bg-blue-600/70 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500"
                    } ${
                      !amount || Number(amount) <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Transfer <FaArrowRight className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrOpen && (
          <QRCode walletAddress={address} onClose={() => setQrOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
