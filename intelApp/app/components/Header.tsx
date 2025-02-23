"use client"
import React from "react";
import { client } from "@/client/client";
import { ConnectButton } from "thirdweb/react";
import Image from "next/image";

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 shadow-md">
      <Image
        src="/static/intelLogo.png"
        alt="Logo"
        width={60}
        height={60}
        className="rounded-full"
      />
      <ConnectButton client={client} />
    </header>
  );
};

export default Header;
