"use client"
import { useState } from "react";

const Passphrase = () => {
  const [isRevealed, setIsRevealed] = useState(false);
  const passphrase = "your-secure-passphrase"; // Fetch from a secure source

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Reveal Passphrase</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <p className="mb-2">
          <strong>Warning:</strong> Keep your passphrase private and secure.
        </p>
        <button
          onClick={() => setIsRevealed(!isRevealed)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          {isRevealed ? "Hide" : "Reveal"} Passphrase
        </button>
        {isRevealed && (
          <p className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded">{passphrase}</p>
        )}
      </div>
    </div>
  );
};

export default Passphrase;
