"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getUser, getUserTransactions } from "@/lib/functions";

interface User {
  id: number;
  email: string;
  passPhrase: string;
  address: string;
  aiBalance: bigint;
  staked: boolean;
  privateKey: string;
}

interface Transaction {
  id:number;
  txHash: string;
  message: string;
  amount: number;
  time: Date;
  senderId: number;
}
const TransactionHistory = () => {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState <Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);

  async function fetchUser(userId: number) {
    const user = await getUser(userId);
    console.log(user);
    if (user) {
      setUser(user);
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchUser(Number(session.user.id));
    }
  }, [session]);

  useEffect(() => {
    // Fetch transaction history from backend or blockchain
    const fetchTransactions = async () => {
      try {
        const results = await getUserTransactions(user?.id ?? 0); // Update with actual API
        console.log(results);
        setTransactions(results);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Transaction History</h1>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          {transactions.map((tx, index) => (
            <li key={index} className="border-b last:border-none p-2">
              <p>
                <strong>Type:</strong>
              </p>
              <p>
                <strong>Amount:</strong> cUSD
              </p>
              <p>
                <strong>Date:</strong>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionHistory;
