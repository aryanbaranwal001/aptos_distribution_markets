'use client';

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { type PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.TESTNET, // Using testnet for development
        aptosApiKeys: {
          testnet: process.env.NEXT_PUBLIC_APTOS_API_KEY,
        }
      }}
      onError={(error) => {
        console.log("Wallet connection error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
