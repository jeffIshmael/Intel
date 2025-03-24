import { createPublicClient, createWalletClient, custom } from "viem";
import { publicClient } from "./config";
import { celo } from "viem/chains";
import { toast } from "sonner";
import ERC20Abi from "@/Blockchain/erc20.json";
import { intelContractAddress, intelAbi } from "../Blockchain/intelContract";

//transfer function
export const processCheckout = async (
  recepient: `0x${string}`,
  amount: number
) => {
  if (window.ethereum) {
    const privateClient = createWalletClient({
      chain: celo,
      transport: custom(window.ethereum),
    });

    const publicClients = createPublicClient({
      chain: celo,
      transport: custom(window.ethereum),
    });

    const [address] = await privateClient.getAddresses();

    try {
      const checkoutTxnHash = await privateClient.writeContract({
        account: address,
        address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
        abi: ERC20Abi,
        functionName: "transfer",
        args: [recepient, BigInt(amount)],
      });

      const checkoutTxnReceipt = await publicClients.waitForTransactionReceipt({
        hash: checkoutTxnHash,
      });

      if (checkoutTxnReceipt.status == "success") {
        // console.log(checkoutTxnHash);
        // console.log(checkoutTxnReceipt.transactionHash);
        return checkoutTxnReceipt.transactionHash;
      }

      return false;
    } catch (error) {
      console.log(error);
      toast("Transaction failed, make sure you have enough balance");
      return false;
    }
  }
  return false;
};

//checking stake of user
export const getStake = async (address: string) => {
  try {
    const data = await publicClient.readContract({
      address: intelContractAddress,
      abi: intelAbi,
      functionName: "getUserStake",
      args: [address],
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};
