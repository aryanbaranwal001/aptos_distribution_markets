'use client';

import Link from 'next/link';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { WalletSelector } from './WalletSelector';

const LandingNavbar = () => {
  const { color, nextColor } = useThemeStore();
  const theme = getThemeClasses(color);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10 pointer-events-none">
      <div className="px-6 sm:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className={`text-2xl font-bold ${theme.text}`}>
              <span className={theme.primary}>Infi</span> Markets
            </h1>
          </div>

          {/* Right side - Demo, Wallet and Theme */}
          <div className="flex items-center space-x-4 pointer-events-auto">
            {/* Demo Button */}
            <Link
              href="/instance/1"
              className={`group relative px-4 py-2 rounded-lg border border-white/15 transition-all duration-200 ${theme.text} hover:${theme.primary} hover:border-current hover:shadow-lg hover:scale-105 whitespace-nowrap overflow-hidden`}
            >
              <span className="relative z-10 font-medium">✨ Demo</span>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={nextColor}
              className={`px-4 py-2 rounded-lg border border-white/15 ${theme.text} hover:bg-white/10 transition-colors`}
              title={`Current theme: ${color}`}
            >
              <span className="hidden sm:inline">Theme: </span>
              <span className={`${theme.primary} font-semibold capitalize`}>
                {color}
              </span>
            </button>

            {/* Wallet Selector */}
            <div className="pointer-events-auto">
              <WalletSelector />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
