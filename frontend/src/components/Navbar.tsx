'use client';

import { useState } from 'react';
import { Search, Menu, X, Sun, Moon, Wallet } from 'lucide-react';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useWalletStore } from '@/store/walletStore';
import { useAppStore } from '@/store/appStore';
import SearchModal from './SearchModal';

const Navbar = () => {
  const { color, mode, nextColor, toggleMode } = useThemeStore();
  const { isConnected, address, connect, disconnect } = useWalletStore();
  const { setSearchOpen } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const theme = getThemeClasses(color, mode);

  const handleWalletConnect = () => {
    if (isConnected) {
      disconnect();
    } else {
      // Simulate wallet connection
      const mockAddress = "0x" + Math.random().toString(16).substr(2, 40);
      connect(mockAddress, "mainnet");
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 ${theme.background} ${theme.text} border-b border-gray-200 dark:border-gray-800`}>
        {/* Top Navbar */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Company Name */}
            <div className="flex-shrink-0">
              <h1 className={`text-xl font-bold ${theme.primary}`}>
                Infi Markets
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(true)}
                  className={`w-full px-4 py-2 text-left ${theme.textSecondary} bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors`}
                >
                  <div className="flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    <span>Search for a market...</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Connect Wallet Button */}
              <button
                onClick={handleWalletConnect}
                className={`flex items-center px-4 py-2 rounded-lg ${theme.primaryBg} ${theme.primaryHover} text-white transition-colors`}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnected ? formatAddress(address!) : 'Connect Wallet'}
              </button>

              {/* Hamburger Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg ${theme.textSecondary} hover:${theme.primary} transition-colors`}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Hamburger Menu Dropdown */}
        {isMenuOpen && (
          <div className={`absolute top-16 right-4 w-48 ${theme.background} border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg`}>
            <div className="py-2">
              <a
                href="/dashboard"
                className={`block px-4 py-2 ${theme.textSecondary} hover:${theme.primary} transition-colors`}
              >
                Dashboard
              </a>
              <button
                onClick={nextColor}
                className={`w-full text-left px-4 py-2 ${theme.textSecondary} hover:${theme.primary} transition-colors`}
              >
                Theme: {color.charAt(0).toUpperCase() + color.slice(1)}
              </button>
              <button
                onClick={toggleMode}
                className={`w-full text-left px-4 py-2 ${theme.textSecondary} hover:${theme.primary} transition-colors flex items-center`}
              >
                {mode === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Search Modal */}
      <SearchModal />
    </>
  );
};

export default Navbar;
