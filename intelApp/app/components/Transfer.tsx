"use client"
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers } from "ethers";
import React from "react";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}
const Transfer = async ({amount, address}:{amount:number, address:string}) => {
  const TransferCUSD = async (amount: number) => {
    console.log("Transfering ...");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const cUSD = new ethers.Contract(
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      [
        "function transfer(address spender, uint256 amount) external returns (bool)",
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
    const tx = await cUSD.transfer(
      address,
      parsedAmount
    );
    await tx.wait();

    console.log("cUSD Transferred!");
  };
  return (
    <div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={()=>TransferCUSD(amount)}
      
      >
        Transfer
      </button>
    </div>
  );
};

export default Transfer;
