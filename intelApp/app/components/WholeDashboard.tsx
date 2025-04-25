"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaBell, FaRegCopy, FaHome } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import StakeModal from "./StakeModal";
import TransferModal from "./TransferModal";
import { getUser } from "@/lib/functions";
import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { celo } from "thirdweb/chains";
import { client } from "@/client/client";
import { ethers, Signer } from "ethers";
import { createTransaction, getCurrentPool, updatePool } from "@/lib/functions";
import { toast } from "sonner";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { IoExitOutline } from "react-icons/io5";
import Link from "next/link";
import { getBestPool } from "@/scripts/Nebula.mjs";
import { getFallbackPool } from "@/lib/helperFunctions";
import { getStake } from "@/lib/TokenTransfer";

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
  emailed: boolean;
  staked: boolean;
  privateKey: string;
}

const WholeDashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stablecoinPools, setStablecoinPools] = useState<Pool[] | null>(null);
  const [bestPool, setBestPool] = useState<Pool | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [poolToStake, setPoolToStake] = useState("");
  const [stakedPool, setStakedPool] = useState("");
  const [currentPool, setCurrentPool] = useState<Pool | null>(null);
  const [fetching, setFetching] = useState(false);
  const [buttonText, setButtonText] = useState("");
  const [unstakingButtonText, setUnstakingButtonText] = useState("");
  const [stablecoinPoolspec, setstablecoinPoolspec] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [amountStaked, setAmountStaked] = useState(0);
  const [reason, setReason] = useState("");
  const [showReason, setShowReason] = useState(false);
  const [fetchingPool, setFetchingPool] = useState(false);
  const { data: session } = useSession();
  const { data: balance } = useReadContract({
    contract,
    method: "function balanceOf(address) returns (uint256)",
    params: [user?.address ?? ""], // type safe params
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchUser(Number(session.user.id));
    }
  }, [session]);

  async function fetchUser(userId: number) {
    const user = await getUser(userId);
    if (user) {
      setUser(user);
      const userStake = await getStake(user.address);
      const result = await getCurrentPool();
      console.log(`result of stakedpool: ${result}.`);
      if (result) {
        setStakedPool(result.poolSpec);
      }
      if (userStake) {
        setAmountStaked(Number(userStake));
      }
    }
  }

  //fetching best pool according to AI
  useEffect(() => {
    if (!stablecoinPools) {
      console.log("No pools available");
      return;
    }
    const poolToStake = stablecoinPools.filter(
      (pool) => pool.project.toLowerCase() !== "uniswap-v3"
    );
    // setBestAIStakingPool(poolToStake[0]);
    console.log("Best AI Staking Pool:", poolToStake[0]);
    const getPool = async () => {
      try {
        setFetchingPool(true);
        const result = await getBestPool(stablecoinPools);
        const match = result.match(/^(.+?) \[(.+?)\]\n(.+)$/);
        const bestPool = {
          name: match[1].trim(),
          id: match[2].trim(),
          reason: match[3].trim(),
        };
        const bestPoolMatch = stablecoinPools.find(
          (pool) => pool.pool === bestPool.id
        );
        if (!bestPoolMatch) {
          console.warn("No matching pool found for AI response");
          return;
        }
        setBestPool(bestPoolMatch);
        setReason(bestPool.reason);
      } catch (error) {
        console.log(error);
        // **Manual fallback logic: Select best pool manually**
        const fallbackPool = getFallbackPool(stablecoinPools);
        console.log("Selected fallback pool:", fallbackPool);

        if (fallbackPool) {
          setBestPool(fallbackPool as Pool | null);
          setReason("Selected manually as best available pool");
        }
      } finally {
        setFetchingPool(false);
      }
    };

    getPool();
  }, [stablecoinPools]);

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

        if (data) {
          // Update pools and best pools
          setStablecoinPools(data.cUSDStableCoins);
          // setBestPool(data.bestCUSDPool);

          // Find the current pool based on `stakedPool`
          const currentPoolFromData = data.cUSDStableCoins.find(
            (pool: Pool) => pool.pool === stakedPool
          );
          console.log(
            `current pool from the received pools:${currentPoolFromData}.`
          );
          if (currentPoolFromData) {
            setCurrentPool(currentPoolFromData);
          }
        }
      } catch (error) {
        console.error("Error fetching pools:", error);
      } finally {
        setFetching(false);
      }
    };

    // Only fetch pools when `user?.id` or `stakedPool` changes
    if (user?.id || stakedPool) {
      fetchPools();
    }
  }, [user, stakedPool]);

  //function to approve cUSD sending to a pool
  const approveCUSD = async (amount: number, signer: Signer) => {
    console.log("Approving cUSD...");
    setButtonText("Approving cUSD transfer...");

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
      toast.error("Insufficient cUSD balance");
    }

    // Approve transaction
    const tx = await cUSD.approve(
      "0x970b12522CA9b4054807a2c5B736149a5BE6f670", // Moola Market Proxy
      parsedAmount
    );
    await tx.wait();

    toast("cUSD Approved!", {
      description: "Now staking...",
    });

    // Verify allowance
    const allowance = await cUSD.allowance(
      await signer.getAddress(),
      "0x970b12522CA9b4054807a2c5B736149a5BE6f670"
    );
    if (allowance < parsedAmount) {
      toast.error("Approval failed, allowance insufficient");
    }
  };

  //function to stake cUSD to a pool
  const stakeCUSD = async (amount: number, signer: Signer) => {
    setButtonText("Staking...");

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

  //function to unstake cUSD from a pool(manually)
  const unStakeCUSD = async (amount: number, signer: Signer) => {
    setUnstakingButtonText("Unstaking...");

    const moolaMarket = new ethers.Contract(
      "0x970b12522CA9b4054807a2c5B736149a5BE6f670", // Moola Market Proxy
      ["function withdraw(address asset, uint256 amount, address to) external"],
      signer
    );

    const parsedAmount = ethers.parseUnits(amount.toString(), 18);

    // Estimate gas (optional)
    const gasEstimate = await moolaMarket.withdraw.estimateGas(
      "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD Address
      parsedAmount,
      await signer.getAddress()
    );

    console.log(`Estimated Gas: ${gasEstimate.toString()}`);

    // Send the transaction
    const tx = await moolaMarket.withdraw(
      "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD Address
      parsedAmount,
      await signer.getAddress(), // onBehalfOf
      { gasLimit: gasEstimate }
    );

    const txFull = await tx.wait();
    console.log("UnStaked from Moola Market!", txFull);
    return txFull;
  };

  const handleStake = async (amount: number, pool: string) => {
    const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
    const privateKey = user?.privateKey ?? "";
    const signer = new ethers.Wallet(privateKey, provider);
    try {
      setIsStaking(true);
      await approveCUSD(amount, signer);
      const result = await stakeCUSD(amount, signer);
      if (result) {
        const transaction = await createTransaction(
          user?.id ?? 0,
          result.hash,
          "You staked",
          amount
        );
        console.log(transaction);
        console.log(pool);

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
                Successfully staked {amount} cUSD to {pool}.
              </p>
              <p className="text-sm text-gray-600">
                <a
                  href={`https://celoscan.io/tx/${result.hash}`}
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
      }
      console.log(result);
      setIsStaking(false);
    } catch (error) {
      console.error("Staking failed:", error);
      toast.error("Unable to stake.");
      setIsStaking(false);
    } finally {
      setIsStaking(false);
    }
  };

  // Copy wallet address
  const copyToClipboard = () => {
    const address = user?.address || "";
    navigator.clipboard.writeText(address);
    toast("Wallet Address Copied!");
  };

  const goToUniswap = () => {
    window.open(`https://app.uniswap.org/explore/pools/celo`, "_blank");
  };

  //function to handle unstaking
  const handleUnstaking = async (amount: number, poolName: string) => {
    if (poolName) {
      toast("Unstaking under development...");
      return;
    }
    const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
    const privateKey = user?.privateKey ?? "";
    const signer = new ethers.Wallet(privateKey, provider);
    try {
      setUnstaking(true);
      const txHash = await unStakeCUSD(amount, signer);
      if (txHash) {
        const transaction = await createTransaction(
          user?.id ?? 0,
          txHash.hash,
          "You unStaked",
          amount
        );
        console.log(transaction);
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
                Successfully unstaked {amount} cUSD from {poolName}.
              </p>
              <p className="text-sm text-gray-600">
                <a
                  href={`https://celoscan.io/tx/${txHash.hash}`}
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
        setUnstaking(false);
      }
    } catch (error) {
      console.log(error);
      setUnstaking(false);
    } finally {
      setUnstaking(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans p-2">
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
                <button
                  onClick={async () => {
                    try {
                      await signOut({ callbackUrl: "/" });
                    } catch (error) {
                      console.error("Sign-out failed:", error);
                    }
                  }}
                  className="text-gray-300 hover:text-gray-400 font-bold"
                >
                  <span className="flex items-center gap-x-2">
                    Log Out <IoExitOutline />
                  </span>
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

      <section className="">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* wallet section */}
          <TransferModal
            address={user?.address ?? ""}
            userId={(user?.id ?? "defaultId").toString()}
            privKey={user?.privateKey ?? ""}
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
                <p className="text-xl font-bold">
                  {Number(amountStaked) / 10 ** 18} cUSD
                </p>
                <button
                  className="bg-red-400 p-2 rounded-md"
                  onClick={() =>
                    handleUnstaking(
                      Number(amountStaked) / 10 ** 18,
                      currentPool?.project ?? ""
                    )
                  }
                >
                  {unstaking ? unstakingButtonText : "Unstake"}
                </button>
              </div>
            ) : (
              <p className="text-gray-400">No pool staked yet</p>
            )}
          </div>
        </div>
      </section>

      {/* best to stake section */}
      <div className="bg-gray-800 mt-6 text-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
        {/* Title Section */}
        <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-500 mb-6">
          ✅ Best Staking Pool
        </h1>

        {stablecoinPools ? (
          fetchingPool ? (
            // Loading Spinner
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-green-400"></div>
            </div>
          ) : (
            // Pool Details Section
            <div className="bg-gray-700 p-6 rounded-lg shadow-md space-y-4">
              {/* Project Name */}
              <h2 className="text-2xl font-bold text-center text-blue-400">
                {bestPool?.project}
              </h2>

              {/* APY Information */}
              <div className="space-x-2 flex flex-col-2 ">
                <p className="text-lg text-gray-400 text-center">
                  Annual Percentage Yield (APY):
                </p>
                <p className="text-lg font-bold text-center text-green-500">
                  {bestPool?.apyBase}%
                </p>
              </div>

              {/* Token Symbol */}
              <p className="text-3xl text-gray-400 font-bold text-center">
                {bestPool?.symbol}
              </p>

              {/* TVL and AI Reason */}
              <div className="flex flex-col items-center space-y-4">
                <div className="space-x-2 flex flex-col-2 ">
                  <p className="text-xl font-semibold text-center">TVL:</p>
                  {/* Total Value Locked (TVL) */}
                  <p className="text-xl font-semibold text-center">
                    ${bestPool?.tvlUsd?.toLocaleString()}
                  </p>
                </div>

                {/* AI Reason */}
                <div className="text-center">
                  <span className="font-semibold text-gray-300">
                    AI&apos;s reason:
                  </span>
                  <span className="text-gray-300 ml-2">
                    {showReason ? (
                      <span>{reason}</span>
                    ) : (
                      <Link
                        href={"#"}
                        onClick={() => setShowReason(true)}
                        className="text-blue-500 hover:text-blue-600 underline cursor-pointer"
                      >
                        Read
                      </Link>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                className={`w-full mt-4 text-white font-semibold py-3 px-6 rounded-lg transition ${
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
                  <span className="flex items-center justify-center gap-1">
                    Go to Uniswap <FaArrowUpRightFromSquare />
                  </span>
                ) : (
                  "Stake Now"
                )}
              </button>
            </div>
          )
        ) : (
          // Placeholder for No Pools
          <div className="text-center text-gray-400">
            No staking pools available.
          </div>
        )}
      </div>

      {/* Top Staking Pools Section */}
      <section className="mt-12 px-6">
        <div>
          <h2 className="text-2xl text-center font-semibold mb-6 border-b border-gray-200 dark:border-gray-700">
            <span>🔥 Top Staking Pools</span>
          </h2>

          <div className="overflow-x-auto ">
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
                  (!stablecoinPools && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-4 text-green-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ))}
                {!fetching && stablecoinPools?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-400">
                      No staking pools found.
                    </td>
                  </tr>
                )}
                {!fetching &&
                  stablecoinPools?.map((pool, index) => (
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
                              setPoolToStake(pool.project ?? "");
                              setstablecoinPoolspec(pool.pool ?? "");
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
          stakingPoolSpec={stablecoinPoolspec}
          setShowStakingModal={setShowStakingModal}
          stakingPool={poolToStake}
          balance={Number(balance)}
          handleStake={handleStake}
          isStaking={isStaking}
          showingText={buttonText}
        />
      )}
    </div>
  );
};

export default WholeDashboard;
