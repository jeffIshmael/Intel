"use client";
import { useEffect, useState } from "react";
import { FaWallet, FaChartLine } from "react-icons/fa";
import { getContract } from "thirdweb";
import { celo } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";
import { client } from "@/client/client";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

import Header from "./components/Header";
import SignUp from "./components/SignUp";
import QRCodeModal from "./components/QRCode";
import StakeModal from "./components/StakeModal";
import Link from "next/link";


const contract = getContract({
  client,
  address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  chain: celo,
});

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

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

export default function Home() {
  const [stablecoinPools, setStablecoinPools] = useState<Pool[] | null>(null);
  const [bestPool, setBestPool] = useState<Pool | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const account = useActiveAccount();
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [stakingPool, setStakingPool] = useState("");
  const [buttonText, setButtonText] = useState("...");
  const [fetching, setFetching] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [stakingPoolSpec, setStakingPoolSpec] = useState("");
  const[reason, setReason] = useState("");
  const [showReason, setShowReason]= useState(false);
  const [fetchingPool, setFetchingPool] = useState(false);

  const { data: balance, isLoading } = useReadContract({
    contract,
    method: "function balanceOf(address) returns (uint256)",
    params: [account?.address ?? ""], // assert that account is not undefined
  });

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
          setStablecoinPools(data.cUSDStableCoins);
          setFetching(false);
        }
      } catch (error) {
        setFetching(false);
        console.log(error);
      } finally {
        setFetching(false);
      }
    };
    fetchPools();
  }, []);

  useEffect(() =>{
    const getBestPool = async() =>{
      try {
        setFetchingPool(true);
        const response = await fetch("/api/pools", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stablecoinPools
          })
        });
        const data = await response.json();
        console.log(data);
        if (data && stablecoinPools) {         
          const intelAIsBest = (stablecoinPools).filter((pool:Pool) => pool.pool === (data.bestPool).id);
          console.log(intelAIsBest[0]);
          setBestPool(intelAIsBest[0]);
          setReason(data.bestPool.reason);
          setFetchingPool(false);
        }
      } catch (error) {
        setFetchingPool(false);
        console.log(error);
      } finally {
        setFetchingPool(false);
      }
    };
    getBestPool();
  },[stablecoinPools])

  useEffect(() => {
    console.log(balance);
  }, [balance]);

  const checkAllowance = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    const cUSD = new ethers.Contract(
      "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD contract
      [
        "function allowance(address owner, address spender) view returns (uint256)",
      ],
      signer
    );

    const allowance = await cUSD.allowance(
      userAddress,
      "0xBecd348aa5cC976BE8E82ca6f13BC3B53197711F"
    );
    console.log("Allowance:", allowance.toString());
  };

  const approveCUSD = async (amount: number) => {
    setButtonText("Approving cUSD transfer ...");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const cUSD = new ethers.Contract(
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)",
        "function balanceOf(address owner) external view returns (uint256)",
      ],
      signer
    );

    const parsedAmount = ethers.parseUnits(amount.toString(), 18);

    // Check balance
    const balance = await cUSD.balanceOf(signer.address);
    if (balance < parsedAmount) {
      throw new Error("Insufficient cUSD balance");
    }

    // Approve transaction
    const tx = await cUSD.approve(
      "0x970b12522CA9b4054807a2c5B736149a5BE6f670",
      parsedAmount
    );
    await tx.wait();

    toast("cUSD Transfer Approved!!", {
      description: "Now staking...",
    });

    setButtonText("checking allowance...");

    // Verify allowance
    const allowance = await cUSD.allowance(
      signer.address,
      "0x970b12522CA9b4054807a2c5B736149a5BE6f670"
    );
    if (allowance < parsedAmount) {
      toast.error("Approval failed, allowance insufficient");
    }
  };

  const stakeCUSD = async (amount: number) => {
    setButtonText("Staking ...");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    const moolaMarket = new ethers.Contract(
      "0x970b12522CA9b4054807a2c5B736149a5BE6f670", // Use Proxy
      [
        "function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
      ],
      signer
    );

    const parsedAmount = ethers.parseUnits(amount.toString(), 18);

    // Estimate gas (optional)
    const gasEstimate = await moolaMarket.deposit.estimateGas(
      "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD address
      parsedAmount,
      userAddress,
      0
    );

    console.log(`Estimated Gas: ${gasEstimate.toString()}`);

    // Send the transaction
    const tx = await moolaMarket.deposit(
      "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD address
      parsedAmount,
      userAddress, // onBehalfOf
      0, // referralCode
      { gasLimit: gasEstimate }
    );

    const txFull = await tx.wait();
    return txFull;
  };

  const handleStake = async (amount: number) => {
    try {
      setIsStaking(true);
      await approveCUSD(amount);
      await checkAllowance();
      const result = await stakeCUSD(amount);
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
              Successfully staked {amount} cUSD to {stakingPool}.
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
      setIsStaking(false);
    } catch (error) {
      console.log("Staking failed:", error);
      toast.error("Staking failed. Please try again.");
    } finally {
      setIsStaking(false);
    }
  };

  const goToUniswap = () => {
    window.open(`https://app.uniswap.org/explore/pools/celo`, "_blank");
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header />
      <div className="text-center py-20 px-6">
        <h1 className="text-5xl font-bold mb-4">
          Maximize Your Staking Rewards
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Smart, automated staking powered by AI for maximum yield.
        </p>
        <button
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg"
          onClick={() => {
            setShowSignUp(true);
          }}
        >
          Try Intel AI
        </button>
      </div>
      <section className="flex flex-wrap justify-center gap-10 px-6">
        <div className="bg-gray-800 p-6 w-80 rounded-lg shadow-lg text-center">
          <FaWallet className="text-blue-400 text-4xl mb-3" />
          <h2 className="text-lg font-semibold">Your Balance</h2>
          <p className="text-green-400 text-xl font-bold">
            {isLoading
              ? "Loading..."
              : !account?.address
              ? "-- cUSD"
              : `${(Number(balance) / 10 ** 18).toFixed(2)} cUSD`}
          </p>
          <button
            onClick={
              !account?.address
                ? () => {
                    toast.error("Please connect your wallet.");
                  }
                : () => setShowQR(true)
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            Deposit
          </button>
        </div>
        {bestPool && (
          <div className="bg-gray-800 p-6 w-80 rounded-lg shadow-lg text-center">
            <FaChartLine className="text-green-400 text-4xl mb-3" />
            <h2 className="text-lg font-bold">Best Stablecoin Pool</h2>
            <p className="text-gray-200 font-bold">{bestPool?.project}</p>
            <p className="text-gray-300">{bestPool?.symbol}</p>
            <p className="text-green-400 text-lg font-bold">
              APY: {bestPool?.apy?.toFixed(2)}%
            </p>
            <p className="text-gray-300">
              TVL: ${bestPool?.tvlUsd?.toLocaleString()}
            </p>
            <p className="text-gray-300">
              <span className="font-semibold">AI&apos;s reason:</span>{" "}
              <span className="text-gray-300">
                {showReason ? (
                  <span>{reason}</span>
                ) : (
                  <Link
                    href={"#"}
                    onClick={() => setShowReason(true)}
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    Read
                  </Link>
                )}
              </span>
            </p>

            <button
              className={` px-5 py-2 rounded-md text-white mt-2 ${
                bestPool?.project !== "uniswap-v3"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-500 hover:bg-gray-600 border border-gray-400"
              }`}
              onClick={() => {
                if (bestPool?.project === "uniswap-v3") {
                  goToUniswap();
                } else {
                  setStakingPool(bestPool?.pool);
                  setShowStakingModal(true);
                }
              }}
            >
              {bestPool?.project === "uniswap-v3" ? (
                <span className="flex flex-col-2 gap-x-1 items-center ">
                  Go to Uniswap <FaArrowUpRightFromSquare />
                </span>
              ) : (
                "Stake"
              )}
            </button>
          </div>
        )}
      </section>
      <section className="mt-12 px-6">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Stablecoin Pools
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead>
              <tr className="text-gray-400 bg-gray-700">
                <th className="p-4">Pool Name</th>
                <th className="p-4">Currency</th>
                <th className="p-4">APY</th>
                <th className="p-4">TVL</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {fetching ||
                (!stablecoinPools && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-green-500">
                      Loading...
                    </td>
                  </tr>
                ))}
              {!fetching && stablecoinPools?.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-400">
                    No stablecoin pools found.
                  </td>
                </tr>
              )}
              {!fetching &&
                stablecoinPools?.map((pool) => (
                  <tr
                    key={pool.pool}
                    className="border-b border-gray-700 hover:bg-gray-700"
                  >
                    <td className="p-4">{pool.project}</td>
                    <td className="p-4">{pool.symbol}</td>
                    <td className="p-4 text-green-400 font-bold">
                      {pool.apy.toFixed(2)}%
                    </td>
                    <td className="p-4">${pool.tvlUsd.toLocaleString()}</td>
                    <td className="p-4">
                      <button
                        className={` px-5 py-2 rounded-md text-white ${
                          pool.project !== "uniswap-v3"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-500 hover:bg-gray-600 border border-gray-400"
                        }`}
                        onClick={() => {
                          if (pool.project === "uniswap-v3") {
                            goToUniswap();
                          } else {
                            setStakingPool(pool.project);
                            setStakingPoolSpec(pool.pool);
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
      </section>
      {showSignUp && (
        <SignUp
          onClose={() => {
            setShowSignUp(false);
          }}
        />
      )}
      {showQR && (
        <QRCodeModal
          walletAddress={account?.address || ""}
          onClose={() => setShowQR(false)}
        />
      )}
      {showStakingModal && (
        <StakeModal
          stakingPoolSpec={stakingPoolSpec}
          setShowStakingModal={setShowStakingModal}
          stakingPool={stakingPool}
          balance={Number(balance)}
          handleStake={handleStake}
          isStaking={isStaking}
          showingText={buttonText}
        />
      )}
    </div>
  );
}
