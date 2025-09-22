'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { markets, Market, formatDate } from '@/data/markets';
import Navbar from '@/components/Navbar';
import CategoryNav from '@/components/CategoryNav';

const MarketInstancePage = () => {
  const params = useParams();
  const { color } = useThemeStore();
  const [market, setMarket] = useState<Market | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [iconSrc, setIconSrc] = useState('');
  const [hasError, setHasError] = useState(false);
  
  // Slider states for mean and std dev
  const [userMean, setUserMean] = useState(0);
  const [userStdDev, setUserStdDev] = useState(0);
  
  const theme = getThemeClasses(color);

  useEffect(() => {
    if (params.slug) {
      // Find market by matching slug with title
      const foundMarket = markets.find(m => {
        const slug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return slug === params.slug;
      });
      
      if (foundMarket) {
        setMarket(foundMarket);
        setIsBookmarked(foundMarket.isBookmarked || false);
        setIconSrc(`/icons/${foundMarket.iconName.replace('.svg', '.png')}`);
        // Initialize sliders with market values
        setUserMean(foundMarket.market_mean);
        setUserStdDev(foundMarket.market_standard_deviation);
      }
    }
  }, [params.slug]);

  const handleImageError = () => {
    if (!hasError && market) {
      setHasError(true);
      const svgSrc = iconSrc.replace('.png', '.svg');
      setIconSrc(svgSrc);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  if (!market) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text}`}>
        <Navbar />
        <CategoryNav />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Market Not Found</h1>
            <Link href="/" className={`${theme.primary} hover:underline`}>
              Return to Markets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate deltas for display
  const deltaMu = userMean - market.market_mean;

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text}`}>
      <Navbar />
      <CategoryNav />
      
      {/* Market Content */}
      <main className="pt-16 px-4 max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className={`inline-flex items-center space-x-2 p-2 rounded-lg ${theme.hoverBg} transition-colors`}>
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Markets</span>
          </Link>
        </div>

        {/* Market Header - Outside Container */}
        <div className="mb-6">
          <div className="flex items-start space-x-6">
            {/* Market Icon */}
            <div className="flex-shrink-0">
              <Image 
                src={iconSrc}
                alt="Market icon"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full"
                onError={handleImageError}
              />
            </div>
            
            {/* Title and Description */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <h1 className="text-3xl font-bold">{market.title}</h1>
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-full transition-colors ${
                    isBookmarked
                      ? `${theme.primaryBg} text-white`
                      : `${theme.textSecondary} hover:${theme.primary}`
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
              <p className={`${theme.textSecondary} text-base leading-relaxed`}>
                {market.description}
              </p>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className={`rounded-lg border ${theme.border} ${theme.cardBg} p-6`}>
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Container - Graph and Data (3/4 width) */}
            <div className="lg:col-span-3">
              {/* Stats Row Above Graph */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-800/20">
                  <div className={`text-xs ${theme.textSecondary} mb-1`}>Value (ECV)</div>
                  <div className="text-lg font-bold">{market.market_mean.toFixed(2)}</div>
                  <div className={`text-xs ${theme.textSecondary}`}>ECV</div>
                </div>
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-800/20">
                  <div className={`text-xs ${theme.textSecondary} mb-1`}>Probability</div>
                  <div className="text-lg font-bold">0.0%</div>
                </div>
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-800/20">
                  <div className={`text-xs ${theme.textSecondary} mb-1`}>Cumulative</div>
                  <div className="text-lg font-bold">100.0%</div>
                </div>
              </div>

              {/* Graph Container */}
              <div className="rounded-lg border border-gray-600/30 bg-gray-800/20 p-8 h-96 mb-6">
                <div className="text-center h-full flex flex-col justify-center">
                  <div className={`text-5xl mb-3 ${theme.textSecondary}`}>📊</div>
                  <h3 className={`text-lg font-semibold mb-2 ${theme.textSecondary}`}>Distribution Graph</h3>
                  <p className={`${theme.textSecondary} text-sm`}>Normal distribution curve will be displayed here</p>
                  <div className="mt-3 flex items-center justify-center">
                    <span className={`text-xs ${theme.textSecondary}`}>Current Market vs Your Proposal visualization</span>
                  </div>
                </div>
              </div>

              {/* Market Parameters Below Graph */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Stiffness Section */}
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-800/20">
                  <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide">STIFFNESS (LOCAL)</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>S</span>
                      <span className="font-mono text-xs">{market.s}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>μ per σ1</span>
                      <span className="font-mono text-xs">{market.mu_per_one}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>σ per σ1</span>
                      <span className="font-mono text-xs">{market.sigma_per_one}</span>
                    </div>
                  </div>
                </div>

                {/* Cap & Scale Section */}
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-800/20">
                  <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide">CAP & SCALE (λ)</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>Peak p</span>
                      <span className="font-mono text-xs">{market.peak_p}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>Headroom</span>
                      <span className="font-mono text-xs">{market.headroom} (79.2%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>λ</span>
                      <span className="font-mono text-xs">{market.Lambda}</span>
                    </div>
                  </div>
                </div>

                {/* Lifecycle Section */}
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-800/20">
                  <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide">LIFECYCLE</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>Status</span>
                      <span className="text-green-500 text-xs">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>Expires</span>
                      <span className="text-xs">{formatDate(market.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>Created</span>
                      <span className="text-xs">{formatDate(market.startDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Container - Sidebar (1/4 width) */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                
                {/* Trade Actions Container */}
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-800/20">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button className={`px-3 py-2 rounded-lg ${theme.primaryBg} text-white text-sm font-semibold hover:opacity-90 transition-opacity`}>
                      Trade
                    </button>
                    <button className="px-3 py-2 rounded-lg border border-gray-600/30 hover:bg-gray-700/30 transition-colors text-sm">
                      Positions
                    </button>
                    <button className="px-3 py-2 rounded-lg border border-gray-600/30 hover:bg-gray-700/30 transition-colors text-sm">
                      Add Liquidity
                    </button>
                  </div>
                </div>

                {/* Proposed Values Container */}
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-800/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className={`text-xs ${theme.textSecondary}`}>Proposed</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>Delta μ</span>
                      <span className="font-mono text-xs">{deltaMu > 0 ? '+' : ''}{deltaMu.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>σ</span>
                      <span className="font-mono text-xs">{userStdDev.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Mean Slider Container */}
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-800/20">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold">MEAN (M)</label>
                    <span className="text-sm font-bold">{userMean.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={userMean}
                    onChange={(e) => setUserMean(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Sigma Slider Container */}
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-800/20">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold">SIGMA (σ)</label>
                    <span className="text-sm font-bold">{userStdDev.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={userStdDev}
                    onChange={(e) => setUserStdDev(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>15</span>
                    <span>30</span>
                  </div>
                </div>

                {/* Collateral Required Container */}
                <div className="p-3 rounded-lg border border-gray-600/30 bg-gray-800/20">
                  <h3 className="text-xs font-semibold mb-2">COLLATERAL REQUIRED</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>Base Fee</span>
                      <span className="font-mono text-xs">0.05 APT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>Protocol Fee</span>
                      <span className="font-mono text-xs">0.02 APT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${theme.textSecondary} text-xs`}>Gas Estimate</span>
                      <span className="font-mono text-xs">0.001 APT</span>
                    </div>
                    <hr className="border-t border-gray-600/30" />
                    <div className="flex justify-between font-semibold text-xs">
                      <span>Total Required</span>
                      <span className="font-mono">0.071 APT</span>
                    </div>
                  </div>
                </div>

                {/* Mean Slider Container */}
                <div className={`p-4 rounded-lg border ${theme.border} bg-white/5`}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold">MEAN (M)</label>
                    <span className="text-lg font-bold">{userMean.toFixed(2)}</span>
                  </div>
                  <div className="mb-2">
                    <input
                      type="range"
                      min={market.market_mean_min}
                      max={market.market_mean_max}
                      step={0.01}
                      value={userMean}
                      onChange={(e) => setUserMean(parseFloat(e.target.value))}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${color}`}
                      style={{
                        background: `linear-gradient(to right, ${color === 'green' ? '#10b981' : color === 'orange' ? '#f97316' : '#f43f5e'} 0%, ${color === 'green' ? '#10b981' : color === 'orange' ? '#f97316' : '#f43f5e'} ${((userMean - market.market_mean_min) / (market.market_mean_max - market.market_mean_min)) * 100}%, #374151 ${((userMean - market.market_mean_min) / (market.market_mean_max - market.market_mean_min)) * 100}%, #374151 100%)`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={theme.textSecondary}>{market.market_mean_min}</span>
                    <span className={theme.textSecondary}>{market.market_mean_max}</span>
                  </div>
                </div>

                {/* Standard Deviation Slider Container */}
                <div className={`p-4 rounded-lg border ${theme.border} bg-white/5`}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold">STD DEV (σ)</label>
                    <span className="text-lg font-bold">{userStdDev.toFixed(3)}</span>
                  </div>
                  <div className="mb-2">
                    <input
                      type="range"
                      min={market.market_standard_deviation_min}
                      max={market.market_standard_deviation_max}
                      step={0.001}
                      value={userStdDev}
                      onChange={(e) => setUserStdDev(parseFloat(e.target.value))}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${color}`}
                      style={{
                        background: `linear-gradient(to right, ${color === 'green' ? '#10b981' : color === 'orange' ? '#f97316' : '#f43f5e'} 0%, ${color === 'green' ? '#10b981' : color === 'orange' ? '#f97316' : '#f43f5e'} ${((userStdDev - market.market_standard_deviation_min) / (market.market_standard_deviation_max - market.market_standard_deviation_min)) * 100}%, #374151 ${((userStdDev - market.market_standard_deviation_min) / (market.market_standard_deviation_max - market.market_standard_deviation_min)) * 100}%, #374151 100%)`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={theme.textSecondary}>{market.market_standard_deviation_min}</span>
                    <span className={theme.textSecondary}>{market.market_standard_deviation_max}</span>
                  </div>
                  <div className={`text-xs ${theme.textSecondary} mt-1`}>
                    Min σ: {market.market_standard_deviation_min} (contract enforced)
                  </div>
                </div>

                {/* Collateral Required Container */}
                <div className={`p-4 rounded-lg border ${theme.border} bg-white/5`}>
                  <h3 className="text-sm font-semibold mb-2">Collateral Required</h3>
                  <div className="text-2xl font-bold mb-1">1.22 <span className="text-sm font-normal">STRK</span></div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className={theme.textSecondary}>FEES (EST)</span>
                      <span>0 STRK Ⓒ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme.textSecondary}>MIN (1x)</span>
                      <span>0.000000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme.textSecondary}>ARG MIN σ</span>
                      <span>243.352</span>
                    </div>
                  </div>
                  <div className={`text-xs ${theme.textSecondary} mt-2`}>
                    Collateral secures against maximum potential loss.
                  </div>
                </div>

                {/* Connect Wallet Button */}
                <button className={`w-full px-4 py-3 rounded-lg ${theme.primaryBg} text-white font-semibold hover:opacity-90 transition-opacity`}>
                  Connect wallet to trade
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default MarketInstancePage;
