"use client";
import { useEffect, useState } from "react";
import { FaWallet, FaChartLine } from "react-icons/fa";
import { getContract } from "thirdweb";
import {  celo } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";
import { client } from "@/client/client";
import { useActiveAccount } from "thirdweb/react";
import {toast} from "sonner";
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";

import Header from "./components/Header";
import SignUp from "./components/SignUp";
import QRCodeModal from "./components/QRCode";
import StakeModal from "./components/StakeModal"

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

//0x765DE816845861e75A25fCA122bb6898B8B1282a
//0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1

//0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A
//0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A - non-fungible position manager
//https://docs.uniswap.org/contracts/v3/reference/deployments/celo-deployments?utm_source=chatgpt.com
//0x970b12522CA9b4054807a2c5B736149a5BE6f670 - moola
//0x970b12522CA9b4054807a2c5B736149a5BE6f670

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
  const [stablecoinPools, setStablecoinPools] = useState<Pool[]>([]);
  const [bestPool, setBestPool] = useState<Pool | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const account = useActiveAccount();
  const [showStakingModal,setShowStakingModal] = useState(false);
  const[stakingPool,setStakingPool] = useState("");
  const [buttonText, setButtonText] = useState("...");
  const [loading, setLoading] = useState(false);

  const { data: balance, isLoading } = useReadContract({
    contract,
    method: "function balanceOf(address) returns (uint256)",
    params: [account?.address ?? ""], // assert that account is not undefined
  });

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await fetch("/api/pools", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log(data);
        if (data) {
          setStablecoinPools(data.allPools);
          setBestPool(data.bestPool);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchPools();
  }, []);

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

    toast.info("cUSD Approved!");

    // Verify allowance
    const allowance = await cUSD.allowance(
      signer.address,
      "0x970b12522CA9b4054807a2c5B736149a5BE6f670"
    );
    if (allowance < parsedAmount) {
      throw new Error("Approval failed, allowance insufficient");
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
      setLoading(true);
      await approveCUSD(amount);
      await checkAllowance();
      const result = await stakeCUSD(amount);
      console.log(loading);
      console.log(buttonText);
      toast.success(
        <>
          Successfully staked.{" "}
          <a
            href={`https://celoscan.io/tx/${result.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Explore on CeloScan
          </a>
        </>
      );
      setLoading(false);
      //result.hash
      //https://app.uniswap.org/explore/pools/celo/0x34757893070B0FC5de37AaF2844255fF90F7F1E0
      //https://app.uniswap.org/explore/pools/celo/0x1c8DafD358d308b880F71eDB5170B010b106Ca60
    } catch (error) {
      console.log("Staking failed:", error);
      toast.error("Staking failed. Please try again.");
    } finally{
      setLoading(false);
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
      <section className="flex flex-wrap justify-center gap-6 px-6">
        <div className="bg-gray-800 p-6 w-80 rounded-lg shadow-lg text-center">
          <FaWallet className="text-blue-400 text-4xl mb-3" />
          <h2 className="text-lg font-semibold">Your Balance</h2>
          <p className="text-green-400 text-xl font-bold">
            {isLoading
              ? "Loading..."
              : `${(Number(balance) / 10 ** 18).toFixed(2)} cUSD`}
          </p>
          <button
            onClick={() => setShowQR(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            Deposit
          </button>
        </div>
        {bestPool && (
          <div className="bg-gray-800 p-6 w-80 rounded-lg shadow-lg text-center">
            <FaChartLine className="text-green-400 text-4xl mb-3" />
            <h2 className="text-lg font-bold">Best Stablecoin Pool</h2>
            <p className="text-gray-300 font-semibold">{bestPool?.project}</p>
            <p className="text-gray-300">{bestPool?.symbol}</p>
            <p className="text-green-400 text-lg font-bold">
              APY: {bestPool?.apy.toFixed(2)}%
            </p>
            <p className="text-gray-300">
              TVL: ${bestPool?.tvlUsd.toLocaleString()}
            </p>
            <button
              className={` px-5 py-2 rounded-md text-white ${
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
              {bestPool?.project === "uniswap-v3" ? "Go to Uniswap" : "Stake"}
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
              {stablecoinPools.map((pool) => (
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
                          setStakingPool(pool.pool)
                          setShowStakingModal(true);
                        }
                      }}
                    >
                      {pool.project === "uniswap-v3"
                        ? "Go to Uniswap"
                        : "Stake"}
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
      {
        showStakingModal && (
          <StakeModal
            showStakingModal={showStakingModal}
            setShowStakingModal={setShowStakingModal}
            stakingPool={stakingPool}
            balance={Number(balance)}
            handleStake={handleStake}
          />
        )
      }
    </div>
  );
}
