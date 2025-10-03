'use client';

// import Link from 'next/link';
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
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex-shrink-0">
              <div 
                className={`w-full h-full transition-all duration-200`}
                style={{ 
                  maskImage: 'url(/infi.svg)',
                  WebkitMaskImage: 'url(/infi.svg)',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  backgroundColor: color === 'green' ? '#11b881' : color === 'orange' ? '#e59500' : '#ef2d56'
                }}
              />
            </div>
            <h1 className={`text-2xl font-extrabold tracking-wide ${theme.text}`}>
              <span className={`${theme.primary} font-roboto`}>Infi Markets</span>
            </h1>
          </div>

          {/* Right side - Demo, Wallet and Theme */}
          <div className="flex items-center space-x-4 pointer-events-auto">
            {/* Demo Button */}


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
