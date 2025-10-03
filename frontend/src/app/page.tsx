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
          <div className=" pointer-events-none">
            <h1 className={` ${theme.text} mb-10`}>
              <span className="text-5xl sm:text-6xl md:text-7xl">Welcome to{' '}</span>
              <span className={`text-6xl sm:text-7xl md:text-8xl ${theme.primary} font-serif font-extrabold tracking-wide`}>Mirae</span>
            </h1>
            <p className={`text-lg sm:text-xl ${theme.textSecondary} mb-12 max-w-2xl mx-auto`}>
              <span className=''>Next generation prediction market on Aptos. <br /> </span>
              <span>From risky guesses to informed trades, capture every outcome.</span>
            </p>
            
            {/* CTA Button */}
            <div className="flex justify-center pointer-events-none">
              <Link 
                href="/trending"
                className={`px-8 py-3 rounded-full font-semibold text-xl transition-all backdrop-blur-sm shadow-lg bg-white/5 hover:bg-white/10 border border-white/20 ${theme.primary} pointer-events-auto`}
              >
                Explore Markets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
