"use client";
import React, { useEffect, useState } from "react";
import { privateKeyToAccount } from "viem/accounts";
import {  isAddress } from "viem";
// import { celo, celoAlfajores } from "viem/chains";
import { publicClient } from "@/lib/config";
import {  intelContractAddress } from "@/Blockchain/intelContract";
import erc20 from "@/Blockchain/erc20.json";

import {createSession, queryContract} from "@/scripts/Nebula.mjs";

const account = privateKeyToAccount(
  "0xd9251f1e1414c6efc8e67a8095448cc34057fc5eb126784ed8e611becdda385d"
);
// const walletClient = createWalletClient({
//   account,
//   chain: celoAlfajores,
//   transport: http(),
// })

const Page = () => {
  // const [outcome, setOutcome] = useState(false);
  // const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // const askNebula = async () => {
  //   try {
  //     console.log("Fetching..");
  //     const response = await fetch("/api/pools", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     const data = await response.json();
  //     console.log(data);
  //     if (data) {
  //       setOutcome(true);
  //       setMessage(data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };
  useEffect(() => {
    const fetchData = async () => {
      const address = isAddress("0x511568465F23EBb0e22d32488219213FD274b377");
      console.log(address);
      try {
        const data = await publicClient.readContract({
          address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
          abi: erc20,
          functionName: "balanceOf",
          args: ['0x4821ced48Fb4456055c86E42587f61c1F39c6315'],//0x164071687a4fb53dD45B96d27F17470CFd2Fa0Bc
        });

        if (data) {
          console.log(Number(data)/10**18);
        } else {
          console.log("cant get it");
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [account]);

  const askNebula = async () => {
    try {
      setLoading(true);
      const session = await createSession();
      const result = await queryContract(intelContractAddress,44787,session);
      console.log(result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-blue bg-pink-400 min-h-max">
      <button className="p-3 rounded-md bg-blue-400" onClick={askNebula}>
        {loading ? "loading.." : "Get Data"}
      </button>
      {/* {outcome && <div>{message}</div>} */}
    </div>
  );
};

export default Page;
