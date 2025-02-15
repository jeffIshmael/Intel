
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { celoAlfajoresTestnet, celo } from "thirdweb/chains";
import {Toaster} from "sonner";

import  SessionWrapper  from "./sessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intel App",
  description: "Auto-staking AI for max profit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>
          <ThirdwebProvider>
            <Toaster />
            {children}</ThirdwebProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
