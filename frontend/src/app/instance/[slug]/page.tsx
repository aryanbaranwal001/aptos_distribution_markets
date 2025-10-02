'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import NormalDistributionChart from '@/components/NormalDistributionChart';
import { formatDate } from '@/utils/formatters';
import { useMarket } from '@/hooks/useMarkets';
import Navbar from '@/components/Navbar';
import CategoryNav from '@/components/CategoryNav';
import AIHelperButton from '@/components/AIHelperButton';
import AIChatSidebar from '@/components/AIChatSidebar';
import BookmarkIcon from '@/components/BookmarkIcon';
import { WalletSelector } from '@/components/WalletSelector';
import { bookmarkStorage } from '@/utils/bookmarkStorage';

const MarketInstancePage = () => {
  const params = useParams();
  const { color } = useThemeStore();
  const { connected, account } = useWallet();
  const [marketId, setMarketId] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [iconSrc, setIconSrc] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Use the new API hook
  const { data: market, loading, error } = useMarket(marketId);
  
  // Check bookmark status when market loads
  useEffect(() => {
    if (market) {
      setIsBookmarked(bookmarkStorage.isBookmarked(market.id));
    }
  }, [market]);
  
  // Slider states for mean and std dev - dynamically set to market values for zero delta
  const [userMean, setUserMean] = useState(market?.market_mean || 0);
  const [userStdDev, setUserStdDev] = useState(market?.market_standard_deviation || 0);
  const [activeTab, setActiveTab] = useState('trade');
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [aptAmount, setAptAmount] = useState<string>('');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  
  // Calculate probability and cumulative values
  const calculateProbabilityAtPoint = (x: number) => {
    if (!market) return { probability: 0, cumulative: 0 };
    
    const coefficient = 1 / (Math.abs(userStdDev) * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - userMean) / Math.abs(userStdDev), 2);
    const probability = coefficient * Math.exp(exponent);
    
    // Simple cumulative calculation (approximation)
    const cumulative = 0.5 * (1 + Math.sign(x - userMean) * Math.sqrt(1 - Math.exp(-2 * Math.pow((x - userMean) / Math.abs(userStdDev), 2) / Math.PI)));
    
    return { probability, cumulative: Math.max(0, Math.min(1, cumulative)) };
  };
  
  const currentStats = hoverValue !== null 
    ? calculateProbabilityAtPoint(hoverValue)
    : calculateProbabilityAtPoint(userMean);
  
  const theme = getThemeClasses(color);

  // First, we need to find the market ID from the slug
  // For now, we'll use the slug as the ID since we don't have a slug-to-ID mapping
  useEffect(() => {
    if (params.slug) {
      // Convert slug back to a potential market ID
      // This is a temporary solution - ideally we'd have a proper slug-to-ID mapping
      setMarketId(params.slug as string);
    }
  }, [params.slug]);
  
  // Update component state when market data is loaded
  useEffect(() => {
    if (market) {
      setIsBookmarked(market.isBookmarked || false);
      
      // Set initial icon source - use PNG directly
      const pngSrc = market.iconName ? `/icons/${market.iconName.replace('.svg', '.png')}` : '/icons/default.png';
      setIconSrc(pngSrc);
      
      // Initialize sliders to center positions for zero delta
      setUserMean(market.market_mean);
      setUserStdDev(market.market_standard_deviation);
    }
  }, [market]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      // Use default icon when PNG fails to load
      setIconSrc('/icons/default.png');
    }
  };

  const handleBookmark = () => {
    if (!market) return;
    
    if (isBookmarked) {
      bookmarkStorage.removeBookmark(market.id);
      setIsBookmarked(false);
    } else {
      bookmarkStorage.addBookmark({
        id: market.id,
        title: market.title,
        description: market.description,
        volume: market.volume,
        categories: market.categories,
        iconName: market.iconName
      });
      setIsBookmarked(true);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text}`}>
        <Navbar />
        <CategoryNav />
        <div className="flex items-center justify-center pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text}`}>
        <Navbar />
        <CategoryNav />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {error ? 'Error Loading Market' : 'Market Not Found'}
            </h1>
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <Link href="/" className={`${theme.primary} hover:underline`}>
              Return to Markets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate deltas for display (removed unused variable)

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text}`}>
      <Navbar />
      <CategoryNav />
      
      {/* Market Content */}
      <main 
        className="pt-12 px-3 max-w-6xl transition-all duration-300"
        style={{
          marginLeft: 'auto',
          marginRight: isChatOpen ? 'calc(384px + auto)' : 'auto',
          transform: isChatOpen ? 'translateX(-192px)' : 'translateX(0)', // Half of chat width to center
        }}
      >
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/" className={`inline-flex items-center space-x-1.5 p-1.5 mt-8 rounded-lg ${theme.hoverBg} transition-colors`}>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-lg">Back to Markets</span>
          </Link>
        </div>

        {/* Market Header - Outside Container */}
        <div className="mb-4">
          <div className="flex items-start space-x-4">
            {/* Market Icon */}
            <div className="flex-shrink-0">
              {iconSrc && (
                <Image 
                  src={iconSrc}
                  alt="Market icon"
                  width={60}
                  height={60}
                  className="w-15 h-15 rounded-full"
                  onError={handleImageError}
                />
              )}
            </div>
            
            {/* Title and Description */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold">{market.title}</h1>
                <button
                  onClick={handleBookmark}
                  className={`p-1.5 rounded-full transition-colors ${
                    isBookmarked
                      ? `${theme.textSecondary}`
                      : `${theme.textSecondary} hover:${theme.primary}`
                  }`}
                >
                  <BookmarkIcon 
                    filled={isBookmarked} 
                    className="w-5 h-5"
                    themeColor={theme.primary}
                  />
                </button>
              </div>
              <p className={`${theme.textSecondary} text-sm leading-relaxed`}>
                {market.description}
              </p>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="rounded-lg border border-gray-500/20 p-4 mb-12" style={{backgroundColor: '#1a1a1f'}}>
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:h-auto">
            
            {/* Left Container - Graph and Data (3/4 width) */}
            <div className="lg:col-span-3">
              {/* Combined Stats, Graph and Market Parameters Container */}
              <div className="rounded-lg border border-gray-500/20 p-4 h-full flex flex-col" style={{backgroundColor: '#1a1a1f'}}>
                {/* Stats Row - Inline Values */}
                <div className="grid grid-cols-3 divide-x divide-gray-500/20 mb-4">
                  <div className="pr-4">
                    <div className={`text-xs ${theme.textSecondary}`}>
                      Value ({market.x_axis_short_form}): <span className="font-bold text-white">{hoverValue !== null ? hoverValue.toFixed(2) : userMean.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="px-4">
                    <div className={`text-xs ${theme.textSecondary}`}>
                      Probability: <span className="font-bold text-white">{(currentStats.probability * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="pl-4">
                    <div className={`text-xs ${theme.textSecondary}`}>
                      Cumulative: <span className="font-bold text-white">{(currentStats.cumulative * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <hr className="border-t border-gray-500/20 mb-4" />

                {/* Graph Section - Flexible Height */}
                <div className="flex-1 mb-3 min-h-[300px]">
                  <NormalDistributionChart
                    marketMean={market.market_mean}
                    marketStdDev={market.market_standard_deviation}
                    userMean={userMean}
                    userStdDev={userStdDev}
                    onHover={setHoverValue}
                    xAxisLabel={market.x_axis_field_name}
                  />
                </div>

                <hr className="border-t border-gray-500/20 mb-3" />

                {/* Market Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-500/20">
                  {/* Stiffness Section */}
                  <div className="py-2 md:py-0 md:pr-3">
                    <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide">STIFFNESS (LOCAL)</h3>
                    <div className="space-y-1.5">
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
                  <div className="py-3 md:py-0 md:px-4">
                    <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide">CAP & SCALE (λ)</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>Peak P</span>
                        <span className="font-mono text-xs">{market.peak_p}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>Headroom</span>
                        <span className="font-mono text-xs">{market.headroom}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${theme.textSecondary} text-xs`}>λ</span>
                        <span className="font-mono text-xs">{market.Lambda}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lifecycle Section */}
                  <div className="py-3 md:py-0 md:pl-4">
                    <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide">LIFECYCLE</h3>
                    <div className="space-y-2">
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
            </div>

            {/* Right Container - Sidebar (1/4 width) */}
            <div className="lg:col-span-1">
              {/* Trading Panel - Single Container */}
              <div className="rounded-lg border border-gray-500/20 p-3 h-full flex flex-col" style={{backgroundColor: '#1a1a1f'}}>
                {/* Trade Actions */}
                <div className="mb-3">
                  <div className="flex gap-0.5 p-0.5 rounded-lg" style={{backgroundColor: '#2a2a2f'}}>
                    <button 
                      onClick={() => setActiveTab('trade')}
                      className={`flex-1 py-1.5 px-1 rounded-lg transition-all duration-200 text-xs font-semibold ${
                        activeTab === 'trade' 
                          ? `${theme.primaryBg} text-black` 
                          : 'hover:bg-gray-600/50 text-gray-300'
                      }`}
                    >
                      Trade
                    </button>
                    <button 
                      onClick={() => setActiveTab('positions')}
                      className={`flex-1 py-1.5 px-1 rounded-lg transition-all duration-200 text-xs font-semibold ${
                        activeTab === 'positions' 
                          ? `${theme.primaryBg} text-black` 
                          : 'hover:bg-gray-600/50 text-gray-300'
                      }`}
                    >
                      Positions
                    </button>
                    <button 
                      onClick={() => setActiveTab('liquidity')}
                      className={`flex-1 py-1.5 px-1 rounded-lg transition-all duration-200 text-xs font-semibold ${
                        activeTab === 'liquidity' 
                          ? `${theme.primaryBg} text-black` 
                          : 'hover:bg-gray-600/50 text-gray-300'
                      }`}
                    >
                      Add Liquidity
                    </button>
                  </div>
                </div>

                {/* Tab Content - Fixed Height Container */}
                <div className="flex-1 overflow-y-auto">
                {activeTab === 'trade' && (
                  <>
                    {/* Delta Values Display */}
                    <div className="mb-3">
                      <div className="mb-2">
                        <span className={`text-xs font-semibold ${theme.textSecondary}`}>PROPOSED</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className={`${theme.textSecondary} text-xs`}>Δμ</span>
                          <span className="font-mono text-xs">{(userMean - market.market_mean).toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`${theme.textSecondary} text-xs`}>Δσ</span>
                          <span className="font-mono text-xs">{(userStdDev - market.market_standard_deviation).toFixed(3)}</span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-t border-gray-500/20 mb-3" />

                    {/* Mean Slider */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold">MEAN (M)</label>
                        <span className="text-sm font-bold">{userMean.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={market.market_mean_min}
                        max={market.market_mean_max}
                        step="0.01"
                        value={userMean}
                        onChange={(e) => setUserMean(Number(e.target.value))}
                        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-600 slider-${color}`}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{market.market_mean_min}</span>
                        <span>{market.market_mean}</span>
                        <span>{market.market_mean_max}</span>
                      </div>
                    </div>

                    <hr className="border-t border-gray-500/20 mb-3" />

                    {/* Sigma Slider */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-semibold">SIGMA (σ)</label>
                        <span className="text-sm font-bold">{userStdDev.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={market.market_standard_deviation_min}
                        max={market.market_standard_deviation_max}
                        step="0.01"
                        value={userStdDev}
                        onChange={(e) => setUserStdDev(Number(e.target.value))}
                        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-600 slider-${color}`}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{market.market_standard_deviation_min}</span>
                        <span>{market.market_standard_deviation}</span>
                        <span>{market.market_standard_deviation_max}</span>
                      </div>
                    </div>

                    <hr className="border-t border-gray-500/20 mb-3" />

                    {/* Collateral Required */}
                    <div className="mb-3">
                      <h3 className="text-xs font-semibold mb-2">COLLATERAL REQUIRED</h3>
                      <div className="space-y-1.5">
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
                        <hr className="border-t border-gray-500/20 my-1.5" />
                        <div className="flex justify-between text-xs">
                          <span>Total Required</span>
                          <span className="font-mono text-sm font-bold">0.071 APT</span>
                        </div>
                      </div>
                    </div>

                    <hr className="border-t border-gray-500/20 mb-3" />

                    {/* Connect Wallet or Trade Button */}
                    {!connected ? (
                      <div className="wallet-selector-wrapper">
                        <div className="w-full [&>*]:w-full">
                          <WalletSelector />
                        </div>
                      </div>
                    ) : (
                      <button className={`w-full px-3 py-2 rounded-lg ${theme.primaryBg} text-black text-sm font-semibold hover:opacity-90 transition-opacity`}>
                        Execute Trade
                      </button>
                    )}
                  </>
                )}

                {activeTab === 'positions' && (
                  <>
                    {!connected ? (
                      <div className="text-center py-8">
                        <div className={`${theme.textSecondary} text-sm mb-4`}>
                          Connect your wallet to view positions
                        </div>
                        <div className="wallet-selector-wrapper">
                          <div className="w-full [&>*]:w-full">
                            <WalletSelector />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className={`${theme.textSecondary} text-sm mb-4`}>
                          No positions found
                        </div>
                        <div className="text-xs text-gray-500">
                          Your market positions will appear here after trading
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'liquidity' && (
                  <>
                    {!connected ? (
                      <div className="text-center py-8">
                        <div className={`${theme.textSecondary} text-sm mb-4`}>
                          Connect your wallet to add liquidity
                        </div>
                        <div className="wallet-selector-wrapper">
                          <div className="w-full [&>*]:w-full">
                            <WalletSelector />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* APT Amount Input */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold">AMOUNT (APT)</label>
                            <span className="text-xs text-gray-500">
                              Balance: {account?.address ? '12.45 APT' : '0.00 APT'}
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              value={aptAmount}
                              onChange={(e) => setAptAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                            />
                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300">
                              MAX
                            </button>
                          </div>
                        </div>

                        <hr className="border-t border-gray-500/20 mb-4" />

                        {/* Slippage Tolerance */}
                        <div className="mb-4">
                          <label className="text-xs font-semibold mb-2 block">SLIPPAGE TOLERANCE</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[0.1, 0.2, 0.5, 1].map((value) => (
                              <button
                                key={value}
                                onClick={() => setSlippageTolerance(value)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                  slippageTolerance === value
                                    ? `${theme.primaryBg} text-black`
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                {value}%
                              </button>
                            ))}
                          </div>
                        </div>

                        <hr className="border-t border-gray-500/20 mb-4" />

                        {/* Liquidity Position Summary */}
                        <div className="mb-2">
                          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wide">POSITION SUMMARY</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className={`${theme.textSecondary} text-xs`}>Expected LP Shares</span>
                              <span className="font-mono text-xs">{aptAmount || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`${theme.textSecondary} text-xs`}>Pool Share</span>
                              <span className="font-mono text-xs">
                                {aptAmount ? ((parseFloat(aptAmount) / (2500000 + parseFloat(aptAmount))) * 100).toFixed(4) : '0.0000'}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`${theme.textSecondary} text-xs`}>Current Pool Size</span>
                              <span className="font-mono text-xs">{(market.volume / 1000000).toFixed(2)}M APT</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`${theme.textSecondary} text-xs`}>Est. APY</span>
                              <span className="font-mono text-xs text-green-400">12.5%</span>
                            </div>
                          </div>
                        </div>

                        <hr className="border-t border-gray-500/20 mb-2" />

                        {/* LP Share Definition */}
                        <div className="mb-2">
                          <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide">LP SHARE DEFINITION</h3>
                          <p className="text-xs text-gray-400 leading-relaxed">
                          LP shares show your pool ownership and earn you proportional trading fees.
                          </p>
                        </div>

                        <hr className="border-t border-gray-500/20 mb-2" />

                        {/* Add Liquidity Button */}
                        <button 
                          className={`w-full px-4 py-3 rounded-xl ${theme.primaryBg} text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                          disabled={!aptAmount || parseFloat(aptAmount) <= 0}
                        >
                          Add Liquidity
                        </button>
                      </>
                    )}
                  </>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
      
      {/* Bottom Spacer */}
      <div className="h-20"></div>
      
      {/* AI Chat Sidebar */}
      <AIChatSidebar 
        isOpen={isChatOpen} 
        marketId={marketId || ''} 
        aiContext={market?.aicontext || ''} 
        onClose={() => setIsChatOpen(false)}
      />
      
      {/* AI Helper Button */}
      <AIHelperButton 
        onToggleChat={() => setIsChatOpen(!isChatOpen)} 
        isChatOpen={isChatOpen} 
      />
    </div>
  );
};

export default MarketInstancePage;
