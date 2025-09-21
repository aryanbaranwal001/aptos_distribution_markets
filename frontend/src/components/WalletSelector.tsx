'use client';

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { Wallet, ChevronDown, LogOut } from "lucide-react";
import { useThemeStore, getThemeClasses } from '@/store/themeStore';

export const WalletSelector = () => {
  const { connect, disconnect, account, connected, wallets } = useWallet();
  const { color } = useThemeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const theme = getThemeClasses(color);

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const truncateAddress = (address: any) => {
    const addressStr = address?.toString() || '';
    return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;
  };

  if (connected && account) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsModalOpen(!isModalOpen)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${theme.primaryBg} text-black font-medium hover:opacity-90 transition-opacity`}
        >
          <Wallet className="w-4 h-4" />
          <span>{truncateAddress(account.address)}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isModalOpen && (
          <div className={`absolute top-full right-0 mt-2 w-48 ${theme.cardBg} border ${theme.border} rounded-lg shadow-lg z-50`}>
            <div className="p-3">
              <div className={`text-sm ${theme.textSecondary} mb-2`}>Connected Account</div>
              <div className={`text-sm ${theme.text} mb-3 break-all`}>
                {account.address?.toString()}
              </div>
              <button
                onClick={handleDisconnect}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg ${theme.textSecondary} hover:${theme.primary} hover:bg-gray-600/10 transition-colors`}
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${theme.primaryBg} text-black font-medium hover:opacity-90 transition-opacity`}
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div 
            className={`${theme.cardBg} border ${theme.border} rounded-lg p-6 w-full max-w-md mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-xl font-semibold ${theme.text} mb-4`}>Connect Wallet</h2>
            
            <div className="space-y-3">
              {wallets?.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleConnect(wallet.name)}
                  disabled={!wallet.readyState}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border ${theme.border} ${theme.text} hover:${theme.hoverBg} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {wallet.icon && (
                    <img 
                      src={wallet.icon} 
                      alt={wallet.name} 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{wallet.name}</div>
                    {!wallet.readyState && (
                      <div className={`text-sm ${theme.textSecondary}`}>Not installed</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className={`w-full mt-4 px-4 py-2 rounded-lg border ${theme.border} ${theme.text} hover:${theme.hoverBg} transition-colors`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};
