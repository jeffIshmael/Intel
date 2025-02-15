import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const StakeModal = ({
  showStakingModal,
  setShowStakingModal,
  stakingPool,
  balance,
  handleStake,
}: {
  showStakingModal: boolean;
  setShowStakingModal: React.Dispatch<React.SetStateAction<boolean>>;
  stakingPool: string;
  balance: number;
  handleStake: (amount: number, pool: string) => Promise<void>;
}) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Stake cUSD</h2>
          <button
            onClick={() => setShowStakingModal(false)}
            disabled={loading}
            className={`text-gray-400 ${
              loading ? "cursor-not-allowed" : "hover:text-white"
            } `}
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
        <p className="flex mr-2 justify-end">
          Available: {(Number(balance) / 10 ** 18).toFixed(2)} cUSD
        </p>

        <button
          onClick={() => {
            setLoading(showStakingModal);
            handleStake(Number(amount), stakingPool);
            setLoading(false);
          }}
          disabled={loading}
          className={`w-full bg-blue-600  text-white font-semibold py-2 px-4 rounded-lg transition ${
            loading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-500"
          }`}
        >
          {loading ? "staking..." : "stake"}
        </button>
      </div>
    </div>
  );
};

export default StakeModal;
