"use client";
import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FaRegCopy, FaTimes, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const QRCodeModal = ({
  walletAddress,
  onClose,
}: {
  walletAddress: string;
  onClose: () => void;
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white p-6 rounded-2xl shadow-xl w-full max-w-md relative border border-gray-200 dark:border-gray-800"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 focus:outline-none"
            aria-label="Close modal"
          >
            <FaTimes size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Scan to Deposit</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Send funds to this address
            </p>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-4 bg-white rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <QRCodeCanvas
                value={walletAddress}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Wallet Address Section */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">
              WALLET ADDRESS
            </p>
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800/80 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-mono truncate">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
              <button
                onClick={copyToClipboard}
                className="ml-3 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors duration-200 focus:outline-none flex items-center"
                aria-label="Copy address"
              >
                {copied ? (
                  <>
                    <FaCheck size={16} className="text-green-500" />
                    <span className="ml-1 text-xs text-green-500">Copied!</span>
                  </>
                ) : (
                  <FaRegCopy size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Tip */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            Only send supported assets to this address
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRCodeModal;
