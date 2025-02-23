"use client";
import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FaRegCopy, FaTimes } from "react-icons/fa";

const QRCodeModal = ({ walletAddress, onClose }: { walletAddress: string; onClose: () => void }) => {
  // Copy wallet address to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    alert("Wallet address copied!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-red-500 focus:outline-none"
        >
          <FaTimes size={20} />
        </button>

        {/* Header */}
        <h2 className="text-lg font-semibold text-center mb-6">Scan to Deposit</h2>

        {/* QR Code Section */}
        <div className="flex flex-col items-center mb-6">
          <QRCodeCanvas
            value={walletAddress}
            size={180}
            bgColor="#ffffff"
            fgColor="#000000"
            className="rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>

        {/* Wallet Address Section */}
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex w-fit justify-between items-center">
          <p className="text-sm truncate text-gray-700 dark:text-gray-300">
            {walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)}
          </p>
          <button
            onClick={copyToClipboard}
            className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 focus:outline-none"
          >
            <FaRegCopy size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;