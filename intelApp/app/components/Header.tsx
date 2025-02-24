"use client"
import React from "react";
import { client } from "@/client/client";
import { ConnectButton } from "thirdweb/react";
import Image from "next/image";

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 shadow-md">
      <div className="flex flex-col-2 space-x-4 items-center">
        <Image
          src="/static/intelLogo.png"
          alt="Logo"
          width={60}
          height={60}
          className="rounded-full"
        />
        <h1 className="text-white text-2xl font-bold font-['Pacifico']">Intel</h1>
      </div>
      <ConnectButton client={client} />
    </header>
  );
};

export default Header;
