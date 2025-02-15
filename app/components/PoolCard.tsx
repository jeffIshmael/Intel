import React from 'react'

const PoolCard = ({ name, apy, tvl }:{name:string, apy:string, tvl:string}) => {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-gray-400">APY: {apy}</p>
        <p className="text-gray-400">TVL: {tvl}</p>
        <button className="mt-4 bg-green-500 px-4 py-2 rounded-lg">Stake</button>
      </div>
    );
  };

export default PoolCard