"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowUpRight, FiX, FiExternalLink } from "react-icons/fi";
import { sendcUSD as withdraw } from "@/lib/allfunctions";

const Withdraw = ({
  privateKey,
  balance,
}: {
  privateKey: string;
  balance: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const address = data.address as `0x${string}`;
      const amount = data.amount as string;

      const hash = await withdraw(
        privateKey as `0x${string}`,
        address,
        Number(amount) * 10 ** 18
      );

      if (hash) {
        toast.success(
          <div className="flex items-center">
            Withdrawal successful
            <a
              href={`https://celoscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center text-blue-500 hover:underline"
            >
              View on Celoscan <FiExternalLink className="ml-1" />
            </a>
          </div>
        );
        setIsOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Withdrawal failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-6 rounded-lg ml-2 transition-all duration-200 hover:shadow-lg"
      >
        Withdraw <FiArrowUpRight className="ml-1" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -20, scale: 0.98 }}
              className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <FiX size={24} />
              </button>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Withdraw Funds
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Enter the recipient address and amount
                </p>

                <form onSubmit={handleWithdraw}>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Recipient Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        placeholder="0x..."
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Amount (cUSD)
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        step="0.0001"
                        min="0.0001"
                        placeholder="0.00"
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mt-2 mr-0 flex justify-end font-roboto">
                    Available Balance: {balance.toFixed(4)} cUSD
                  </p>

                  <div className="mt-8 flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition flex items-center justify-center ${
                        isLoading ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
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
                        </span>
                      ) : (
                        "Withdraw"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Withdraw;
