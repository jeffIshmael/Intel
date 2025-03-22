"use client";
import React, { useState } from "react";


const Page = () => {
  const [outcome, setOutcome] = useState(false);
  const [message, setMessage] = useState("");
  const askNebula = async () => {
    try {
      console.log("Fetching..");
      const response = await fetch("/api/pools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
      if (data) {
        setOutcome(true);
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="text-blue bg-pink-400 min-h-max">
      <button className="p-3 rounded-md bg-blue-400" onClick={askNebula}>
        Get Data
      </button>
      {outcome && <div>{message}</div>}
    </div>
  );
};

export default Page;
