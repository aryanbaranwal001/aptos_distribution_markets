'use client';

import Link from 'next/link';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import LandingNavbar from '@/components/LandingNavbar';
import LiquidEther from '@/components/LiquidEther';

export default function Home() {
  const { color } = useThemeStore();
  const theme = getThemeClasses(color);

  // Get LiquidEther colors directly from theme
  const liquidEtherColors: string[] = theme.liquidEther;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* LiquidEther Background - Full Screen */}
      <div className="absolute inset-0 w-full h-full">
        <LiquidEther
          colors={liquidEtherColors}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.4}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Landing Navbar */}
      <LandingNavbar />

      {/* Content Overlay - Pointer events none to allow LiquidEther interaction */}
      <div className="relative z-10 flex items-center justify-center min-h-screen pointer-events-none">
        <div className="text-center max-w-4xl mx-auto px-6 sm:px-12">
          {/* Hero Content - Allow mouse events to pass through background */}
          <div className="backdrop-blur-sm bg-black/20 rounded-2xl p-8 sm:p-12 border border-white/10 pointer-events-none">
            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold ${theme.text} mb-6`}>
              Welcome to{' '}
              <span className={theme.primary}>Infi Markets</span>
            </h1>
            <p className={`text-lg sm:text-xl ${theme.textSecondary} mb-8 max-w-2xl mx-auto`}>
              The future of prediction markets and distribution trading on the Aptos blockchain. 
              Trade on real-world events with cutting-edge technology.
            </p>
            
            {/* CTA Button */}
            <div className="flex justify-center pointer-events-auto">
              <Link 
                href="/trending"
                className={`px-10 py-5 rounded-lg ${theme.primaryBg} text-black font-semibold text-xl hover:opacity-90 transition-all backdrop-blur-sm shadow-lg`}
              >
                Explore Trending Markets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
