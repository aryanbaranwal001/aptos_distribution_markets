'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { markets, Market, formatVolume, formatDate, truncateAddress } from '@/data/markets';
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

  // Calculate deltas
  const deltaMu = userMean - market.market_mean;
  const deltaSigma = userStdDev - market.market_standard_deviation;

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

        {/* Market Header */}
        <div className="mb-8">
          {/* Market Icon */}
          <div className="flex justify-center mb-6">
            <Image 
              src={iconSrc}
              alt="Market icon"
              width={120}
              height={120}
              className="w-30 h-30 rounded-full"
              onError={handleImageError}
            />
          </div>
          
          {/* Title and Description */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <h1 className="text-3xl font-bold">{market.title}</h1>
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked
                    ? `${theme.primaryBg} text-white`
                    : `${theme.textSecondary} hover:${theme.primary}`
                }`}
              >
                <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
            <p className={`${theme.textSecondary} text-lg leading-relaxed max-w-4xl mx-auto`}>
              {market.description}
            </p>
          </div>
        </div>

        {/* Graph Placeholder */}
        <div className={`mb-8 p-8 rounded-lg border-2 border-dashed ${theme.border} ${theme.cardBg}`}>
          <div className="text-center">
            <div className={`text-6xl mb-4 ${theme.textSecondary}`}>📊</div>
            <h3 className={`text-xl font-semibold mb-2 ${theme.textSecondary}`}>Distribution Graph</h3>
            <p className={`${theme.textSecondary}`}>Graph rendering area - Normal distribution curve will be displayed here</p>
            <div className="mt-4 h-64 flex items-center justify-center">
              <span className={`text-sm ${theme.textSecondary}`}>Graph visualization placeholder</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Sliders and Parameters */}
          <div className="space-y-6">
            {/* Mean Slider */}
            <div className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-semibold">Mean</label>
                <span className={`text-2xl font-bold ${theme.primary}`}>
                  {userMean.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={market.market_mean_min}
                max={market.market_mean_max}
                step={0.01}
                value={userMean}
                onChange={(e) => setUserMean(parseFloat(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme.accent}`}
              />
              <div className="flex justify-between text-sm mt-2">
                <span className={theme.textSecondary}>Min: {market.market_mean_min}</span>
                <span className={theme.textSecondary}>Max: {market.market_mean_max}</span>
              </div>
            </div>

            {/* Standard Deviation Slider */}
            <div className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-semibold">Standard Deviation</label>
                <span className={`text-2xl font-bold ${theme.primary}`}>
                  {userStdDev.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={market.market_standard_deviation_min}
                max={market.market_standard_deviation_max}
                step={0.01}
                value={userStdDev}
                onChange={(e) => setUserStdDev(parseFloat(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${theme.accent}`}
              />
              <div className="flex justify-between text-sm mt-2">
                <span className={theme.textSecondary}>Min: {market.market_standard_deviation_min}</span>
                <span className={theme.textSecondary}>Max: {market.market_standard_deviation_max}</span>
              </div>
            </div>

            {/* Delta Values */}
            <div className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-xl font-semibold mb-4">Proposed Deltas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Delta μ (Mu):</span>
                  <span className={`font-mono ${deltaMu >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {deltaMu >= 0 ? '+' : ''}{deltaMu.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Delta σ (Sigma):</span>
                  <span className={`font-mono ${deltaSigma >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {deltaSigma >= 0 ? '+' : ''}{deltaSigma.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Market Parameters */}
          <div className="space-y-6">
            {/* Market Parameters */}
            <div className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-xl font-semibold mb-4">Market Parameters</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Min Sigma:</span>
                  <span className="font-mono">{market.min_sigma}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Lambda:</span>
                  <span className="font-mono">{market.Lambda}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Peak P:</span>
                  <span className="font-mono">{market.peak_p}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Headroom:</span>
                  <span className="font-mono">{market.headroom}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>S:</span>
                  <span className="font-mono">{market.s}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>μ per one:</span>
                  <span className="font-mono">{market.mu_per_one}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>σ per one:</span>
                  <span className="font-mono">{market.sigma_per_one}</span>
                </div>
              </div>
            </div>

            {/* Axis Information */}
            <div className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-xl font-semibold mb-4">Axis Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>X-Axis Field:</span>
                  <span>{market.x_axis_field_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>X-Axis Short:</span>
                  <span>{market.x_axis_short_form}</span>
                </div>
              </div>
            </div>

            {/* Market Info */}
            <div className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-xl font-semibold mb-4">Market Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Market ID:</span>
                  <span>{market.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Volume:</span>
                  <span className={theme.primary}>{formatVolume(market.volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Contract:</span>
                  <span className="font-mono text-sm">{truncateAddress(market.address)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Start Date:</span>
                  <span>{formatDate(market.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>End Date:</span>
                  <span>{formatDate(market.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Categories:</span>
                  <div className="flex flex-wrap gap-1">
                    {market.categories.map((category) => (
                      <span
                        key={category}
                        className={`px-2 py-1 text-xs rounded-full ${theme.primaryBg} text-white`}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketInstancePage;
