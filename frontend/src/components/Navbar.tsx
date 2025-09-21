'use client';

import { useState, useRef } from 'react';
import { Search, Menu, Wallet } from 'lucide-react';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useWalletStore } from '@/store/walletStore';
import { useAppStore } from '@/store/appStore';
import SearchResults from './SearchResults';

const Navbar = () => {
  const { color, nextColor } = useThemeStore();
  const { isConnected, address, connect, disconnect } = useWalletStore();
  const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const theme = getThemeClasses(color);

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

  const handleMenuMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setIsMenuOpen(true);
  };

  const handleMenuMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 150); // 150ms delay
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 ${theme.background} ${theme.text}`}>
        {/* Top Navbar */}
        <div className="px-12 sm:px-24 lg:px-48">
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
                <div className={`relative ${isSearchOpen ? theme.searchBg : theme.cardBg} ${isSearchOpen ? 'rounded-t-lg border border-b-0' : 'rounded-lg'} ${isSearchOpen ? theme.searchBorder : ''}`}>
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme.textSecondary}`} />
                  <input
                    type="text"
                    placeholder="Search for a market..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchOpen(true)}
                    className={`search-input w-full pl-10 pr-4 py-2 bg-transparent ${theme.text} placeholder-gray-400 outline-none ${isSearchOpen ? 'rounded-t-lg' : 'rounded-lg'}`}
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {isSearchOpen && (
                  <div className={`absolute top-full left-0 right-0 ${theme.searchBg} rounded-b-lg shadow-xl z-50 border border-t ${theme.searchBorder}`} style={{ height: '384px' }}>
                    <SearchResults onClose={() => setSearchOpen(false)} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Connect Wallet Button */}
              <button
                onClick={handleWalletConnect}
                className={`flex items-center px-4 py-2 rounded-lg ${theme.primaryBg} ${theme.primaryHover} text-black transition-colors`}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnected ? formatAddress(address!) : 'Connect Wallet'}
              </button>

              {/* Hamburger Menu */}
              <div
                className="relative"
                onMouseEnter={handleMenuMouseEnter}
                onMouseLeave={handleMenuMouseLeave}
              >
                <button
                  className={`p-2 rounded-lg ${theme.textSecondary} hover:${theme.primary} hover:bg-gray-600/15 transition-all duration-200`}
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                {/* Invisible bridge to prevent menu from closing */}
                {isMenuOpen && (
                  <div className="absolute top-full right-0 w-40 h-6 z-40" />
                )}
                
                {/* Hamburger Menu Dropdown */}
                <div className={`absolute top-full right-0 mt-6 w-40 ${theme.cardBg} border ${theme.border} rounded-lg shadow-lg z-50 transition-all duration-200 ease-out ${
                  isMenuOpen 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-[-10px] scale-95 pointer-events-none'
                } sm:right-0 xs:right-[-12px]`}>
                  <div className="py-2">
                    <a
                      href="/dashboard"
                      className={`block px-4 py-2 ${theme.textSecondary} hover:${theme.primary} hover:bg-gray-600/10 transition-colors`}
                    >
                      Dashboard
                    </a>
                    <button
                      onClick={nextColor}
                      className={`w-full text-left px-4 py-2 ${theme.textSecondary} hover:${theme.primary} hover:bg-gray-600/10 transition-colors`}
                    >
                      Theme: {color.charAt(0).toUpperCase() + color.slice(1)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </nav>

    </>
  );
};

export default Navbar;
