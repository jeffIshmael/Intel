"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaBell, FaRegCopy, FaHome } from "react-icons/fa";
import { useSession } from "next-auth/react";
import StakeModal from "./StakeModal";
import TransferModal from "./TransferModal";
import { getUser } from "@/lib/functions";
import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { celo } from "thirdweb/chains";
import { client } from "@/client/client";
import { ethers, Signer } from "ethers";
import {
  createTransaction,
  updateStakedPool,
  getCurrentStakedPool,
} from "@/lib/functions";
import { toast } from "sonner";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

const contract = getContract({
  client,
  address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  chain: celo,
});

interface Pool {
  apy: number;
  apyBase: number;
  apyBase7d: number;
  apyBaseInception: null;
  apyMean30d: number;
  apyPct1D: number;
  apyPct7D: number;
  apyPct30D: number;
  apyReward: null;
  chain: string;
  count: number;
  exposure: string;
  il7d: null;
  ilRisk: string;
  mu: 5.33035;
  outlier: boolean;
  pool: string;
  poolMeta: string;
  predictions: {
    binnedConfidence: number;
    predictedClass: string;
    predictedProbability: number;
  };
  project: string;
  rewardTokens: null;
  sigma: number;
  stablecoin: boolean;
  symbol: string;
  tvlUsd: number;
  underlyingTokens: [];
  volumeUsd1d: number;
  volumeUsd7d: number;
}

interface User {
  id: number;
  email: string;
  passPhrase: string;
  address: string;
  aiBalance: bigint;
  staked: boolean;
  privateKey: string;
}

const WholeDashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stakingPools, setStakingPools] = useState<Pool[]>([]);
  const [bestPool, setBestPool] = useState<Pool | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [poolToStake, setPoolToStake] = useState("");
  const [stakedPool, setStakedPool] = useState("");
  const [currentPool, setCurrentPool] = useState<Pool | null>(null);
  const [amountStaked, setAmountStaked] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { data: session } = useSession();
  const { data: balance } = useReadContract({
    contract,
    method: "function balanceOf(address) returns (uint256)",
    params: [user?.address ?? ""], // type safe params
  });

  async function fetchUser(userId: number) {
    const user = await getUser(userId);
    console.log(user);
    if (user) {
      setUser(user);
      const result = await getCurrentStakedPool(userId);
      console.log(result);
      if (result) {
        setStakedPool(result.poolSpec);
        setAmountStaked(Number(result.amountStaked));
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      setLoading(true);
      fetchUser(Number(session.user.id));
    }
  }, [session]);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setFetching(true);
        const response = await fetch("/api/pools", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log(data);
        if (data) {
          setStakingPools(data.allPools);
          setBestPool(data.bestPool);
          setCurrentPool(
            data.allPools.filter((pool: Pool) => pool.pool === stakedPool)[0]
          );
          setFetching(false);
        }
      } catch (error) {
        console.log(error);
        setFetching(false);
      } finally {
        setFetching(false);
      }
    };
    fetchPools();
  }, [user?.id, stakedPool]);

  const approveCUSD = async (amount: number, signer: Signer) => {
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
    const balance = await cUSD.balanceOf(await signer.getAddress());
    console.log(balance);
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
      await signer.getAddress(),
      "0x970b12522CA9b4054807a2c5B736149a5BE6f670"
    );
    if (allowance < parsedAmount) {
      throw new Error("Approval failed, allowance insufficient");
    }
  };

  const stakeCUSD = async (amount: number, signer: Signer) => {
    console.log("Staking in Moola...");

    const moolaMarket = new ethers.Contract(
      "0x970b12522CA9b4054807a2c5B736149a5BE6f670", // Moola Market Proxy
      [
        "function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
      ],
      signer
    );

    const parsedAmount = ethers.parseUnits(amount.toString(), 18);

    // Estimate gas (optional)
    const gasEstimate = await moolaMarket.deposit.estimateGas(
      "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD Address
      parsedAmount,
      await signer.getAddress(),
      0
    );

    console.log(`Estimated Gas: ${gasEstimate.toString()}`);

    // Send the transaction
    const tx = await moolaMarket.deposit(
      "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD Address
      parsedAmount,
      await signer.getAddress(), // onBehalfOf
      0, // referralCode
      { gasLimit: gasEstimate }
    );

    const txFull = await tx.wait();
    console.log("Staked in Moola Market!", txFull);
    return txFull;
  };

  const handleStake = async (amount: number, pool: string) => {
    const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
    const privateKey = user?.privateKey ?? "";
    console.log(privateKey);
    const signer = new ethers.Wallet(privateKey, provider);
    console.log(signer);
    try {
      await approveCUSD(amount, signer);
      const result = await stakeCUSD(amount, signer);
      if (result) {
        const transaction = await createTransaction(
          user?.id ?? 0,
          result.hash,
          "You staked",
          amount
        );
        console.log(pool);
        await updateStakedPool(user?.id ?? 0, pool, BigInt(amount * 10 ** 18));
        toast.success(
          <>
            Successfully staked.{" "}
            <a
              href={`https://celoscan.io/tx/${transaction.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Explore on CeloScan
            </a>
          </>
        );
      }
      console.log(result);
    } catch (error) {
      console.error("Staking failed:", error);
    }
  };

  // Copy wallet address
  const copyToClipboard = () => {
    const address = user?.address || "";
    navigator.clipboard.writeText(address);
    toast.info("Wallet Address Copied!");
  };

  const goToUniswap = () => {
    window.open(`https://app.uniswap.org/explore/pools/celo`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col-2 space-x-6">
          <FaHome
            size={24}
            className="cursor-pointer text-gray-400  hover:text-white"
            onClick={() => router.push("/")}
            title="Home"
          />
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>

        <div className="relative">
          {/* Profile Icon */}
          <div
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {/* Profile Initials */}
            <div
              title="User Profile"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white font-semibold text-lg"
            >
              {(user?.email ?? "")?.slice(0, 1)?.toUpperCase()}
            </div>
            {/* Notification Bell Icon */}
            <FaBell
              size={24}
              className="cursor-pointer text-gray-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the profile dropdown
                setShowNotifications(!showNotifications);
              }}
            />
          </div>

          {/* Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md py-2 z-10"
              onClick={(e) => e.stopPropagation()} // Prevent closing on click inside the dropdown
            >
              {/* {userID} */}
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                ID: {user?.id}
              </div>
              {/* Email */}
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                {user?.email}
              </div>

              {/* Wallet Address with Copy Icon */}
              <div className="flex items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="truncate mr-2">
                  {user?.address?.slice(0, 6) +
                    "..." +
                    user?.address?.slice(-4)}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaRegCopy size={16} />
                </button>
              </div>

              {/* Transaction History */}
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <button className="text-blue-500 hover:text-blue-600">
                  View Transaction History
                </button>
              </div>

              {/* Reveal Passphrase */}
              <div className="px-4 py-2">
                <button className="text-red-500 hover:text-red-600">
                  Reveal Passphrase
                </button>
              </div>
              {/* LogOut */}
              <div className="px-4 py-2">
                <button className="text-gray-500 hover:text-gray-600">
                  Log Out
                </button>
              </div>
            </div>
          )}

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className="absolute right-12 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <strong>Notifications</strong>
              </div>
              <div className="px-4 py-2">
                <p>You have no new notifications.</p>
              </div>
            </div>
          )}

          {/* Close dropdowns when clicking outside */}
          <div
            className={`fixed inset-0 ${
              isDropdownOpen || showNotifications ? "" : "hidden"
            }`}
            onClick={() => {
              setIsDropdownOpen(false);
              setShowNotifications(false);
            }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-1 md:grid-cols-2">
        {/* wallet section */}

        <TransferModal
          balance={Number(balance) / 10 ** 18}
          aiBalance={Number(user?.aiBalance ?? 0)}
          address={user?.address ?? ""}
          userId={(user?.id ?? "defaultId").toString()}
          poolSpec={bestPool?.pool ?? ""}
          stake={handleStake}
        />

        {/* staked pool section */}
        <div className="bg-gray-700 text-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
          <h1 className="text-xl font-semibold mb-4">Current Staked Pool</h1>
          {user?.staked ? (
            <div className="bg-gray-800 p-5 rounded-lg shadow-md">
              <h2 className="text-lg font-bold text-green-400">
                {currentPool?.project ?? ""}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Annual Percentage Yield (APY)
              </p>
              <p className="text-2xl font-semibold text-green-500">
                {currentPool?.apyBase}
              </p>

              <p className="text-sm text-gray-400 mt-2">Amount Staked</p>
              <p className="text-xl font-bold">{amountStaked}</p>
            </div>
          ) : (
            <p className="text-gray-400">No pool staked yet</p>
          )}
        </div>
      </div>

      {/* best to stake section */}
      <div className="bg-gray-800 mt-6 text-white p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h1 className="text-xl font-semibold mb-4">🔥 Best Staking Pool</h1>
        {fetching ? (
          <div className="text-gray-300">Loading...</div>
        ) : (
          <div className="bg-gray-700 p-5 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-blue-400">
              {bestPool?.project}
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Annual Percentage Yield (APY)
            </p>
            <p className="text-2xl font-semibold text-green-500">
              {bestPool?.apyBase}
            </p>

            <p className="text-sm text-gray-400 mt-2">{bestPool?.symbol}</p>
            <div className="flex flex-col-2 space-x-4">
              <p className="text-xl font-bold">{bestPool?.tvlUsd}</p>
              <button
                className={`mt-4  text-white font-semibold py-2 px-4 rounded-lg transition mr-0 ${
                  bestPool?.project !== "uniswap-v3"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-500 hover:bg-gray-600 border border-gray-400"
                }`}
                onClick={() => {
                  if (bestPool?.project === "uniswap-v3") {
                    goToUniswap();
                  } else {
                    setPoolToStake(bestPool?.pool ?? "");
                    setShowStakingModal(true);
                  }
                }}
              >
                {bestPool?.project === "uniswap-v3" ? (
                  <span className="flex flex-col-2 gap-x-1 items-center">
                    Go to Uniswap <FaArrowUpRightFromSquare />
                  </span>
                ) : (
                  "Stake"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Staking Pools Section */}
      <section className="mt-12 px-6">
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔥 Top Staking Pools</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full overflow-hidden">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 text-left">
                  <th className="px-4 py-2">Pool Name</th>
                  <th className="px-4 py-2">Symbol</th>
                  <th className="px-4 py-2">APY (30d Avg)</th>
                  <th className="px-4 py-2">TVL</th>
                  <th className="px-4 py-2">Predicted Trend</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {fetching ||
                  (!stakingPools && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-4 text-green-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ))}
                {!fetching && stakingPools?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-400">
                      No staking pools found.
                    </td>
                  </tr>
                )}
                {!fetching &&
                  stakingPools?.map((pool, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : ""
                      }`}
                    >
                      <td className="px-4 py-3">{pool.project}</td>
                      <td className="px-4 py-3">{pool.symbol}</td>
                      <td className="px-4 py-3">{pool.apyMean30d}</td>
                      <td className="px-4 py-3">{pool.tvlUsd}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-sm font-semibold rounded-lg ${
                            pool.predictions.predictedClass === "Stable/Up"
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {pool.predictions.predictedClass} (
                          {pool.predictions.predictedProbability})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className={`text-white font-semibold py-2 px-4 rounded-lg transition ${
                            pool.project !== "uniswap-v3"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-500 hover:bg-gray-600 border border-gray-400"
                          }`}
                          onClick={() => {
                            if (pool.project === "uniswap-v3") {
                              goToUniswap();
                            } else {
                              setPoolToStake(pool.pool ?? "");
                              setShowStakingModal(true);
                            }
                          }}
                        >
                          {pool.project === "uniswap-v3" ? (
                            <span className="flex flex-col-2 gap-x-1 items-center">
                              Go to Uniswap <FaArrowUpRightFromSquare />
                            </span>
                          ) : (
                            "Stake"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {showStakingModal && (
        <StakeModal
          showStakingModal={showStakingModal}
          setShowStakingModal={setShowStakingModal}
          stakingPool={poolToStake}
          balance={Number(balance)}
          handleStake={handleStake}
        />
      )}
    </div>
  );
};

export default WholeDashboard;
