'use client';

import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { WalletSelector } from './WalletSelector';

const LandingNavbar = () => {
  const { color, nextColor } = useThemeStore();
  const theme = getThemeClasses(color);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="px-6 sm:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className={`text-2xl font-bold ${theme.text}`}>
              <span className={theme.primary}>Infi</span> Markets
            </h1>
          </div>

          {/* Right side - Wallet and Theme */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={nextColor}
              className={`px-4 py-2 rounded-lg border border-white/20 ${theme.text} hover:bg-white/10 transition-colors backdrop-blur-sm`}
              title={`Current theme: ${color}`}
            >
              <span className="hidden sm:inline">Theme: </span>
              <span className={`${theme.primary} font-semibold capitalize`}>
                {color}
              </span>
            </button>

            {/* Wallet Selector */}
            <WalletSelector />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
