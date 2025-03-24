
import React from "react";
import {processCheckout} from "@/lib/TokenTransfer";


const Transfer = ({amount, recepient}:{amount:number, recepient:`0x${string}`}) => {
  const TransferCUSD = async () => {
    try{
      const result = await processCheckout(recepient, amount * 10**18);
      console.log(result);
    }catch(error){
      console.log(error);
    }
  };

 
  return (
    <div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={()=>TransferCUSD()}
      >
        Transfer
      </button>
    </div>
  );
};

export default Transfer;
