'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, TrendingUp, Users, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { markets, Market, formatVolume } from '@/data/markets';

const MarketDetailPage = () => {
  const params = useParams();
  const { color } = useThemeStore();
  const [market, setMarket] = useState<Market | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [iconSrc, setIconSrc] = useState('');
  const [hasError, setHasError] = useState(false);
  
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
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Market Not Found</h1>
          <Link href="/" className={`${theme.primary} hover:underline`}>
            Return to Markets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <div className={`border-b ${theme.border} ${theme.cardBg}`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/" className={`p-2 rounded-lg ${theme.hoverBg} transition-colors`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">Market Details</h1>
          </div>
          
          <div className="flex items-start space-x-6">
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
            
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-3">{market.title}</h2>
              <p className={`${theme.textSecondary} text-lg leading-relaxed mb-4`}>
                {market.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {market.categories.map((category) => (
                  <span
                    key={category}
                    className={`px-3 py-1 text-sm rounded-full ${theme.primaryBg} text-white`}
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleBookmark}
              className={`p-3 rounded-full transition-colors ${
                isBookmarked
                  ? `${theme.primaryBg} text-white`
                  : `${theme.textSecondary} hover:${theme.primary}`
              }`}
            >
              <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-xl font-semibold mb-4">Market Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <TrendingUp className={`w-8 h-8 ${theme.primary} mx-auto mb-2`} />
                  <div className="text-2xl font-bold">{formatVolume(market.volume)}</div>
                  <div className={`text-sm ${theme.textSecondary}`}>Total Volume</div>
                </div>
                <div className="text-center">
                  <Users className={`w-8 h-8 ${theme.primary} mx-auto mb-2`} />
                  <div className="text-2xl font-bold">1,234</div>
                  <div className={`text-sm ${theme.textSecondary}`}>Active Traders</div>
                </div>
                <div className="text-center">
                  <Calendar className={`w-8 h-8 ${theme.primary} mx-auto mb-2`} />
                  <div className="text-2xl font-bold">Dec 2024</div>
                  <div className={`text-sm ${theme.textSecondary}`}>Resolution Date</div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-xl font-semibold mb-4">Market Analysis</h3>
              <div className={`${theme.textSecondary} space-y-4`}>
                <p>
                  This prediction market allows traders to bet on the outcome of {market.title.toLowerCase()}. 
                  The market has attracted significant attention with a total volume of {formatVolume(market.volume)}.
                </p>
                <p>
                  Market participants can buy shares representing different outcomes, with prices reflecting 
                  the collective probability assessment of the community. As new information becomes available, 
                  prices adjust to reflect updated probabilities.
                </p>
                <p>
                  The market will resolve based on verifiable outcomes from reliable sources, ensuring 
                  fair and transparent settlement for all participants.
                </p>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            <div className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-xl font-semibold mb-4">Trade</h3>
              <div className="space-y-4">
                <button className={`w-full py-3 px-4 rounded-lg ${theme.primaryBg} text-white font-semibold hover:opacity-90 transition-opacity`}>
                  Buy Yes - $0.65
                </button>
                <button className={`w-full py-3 px-4 rounded-lg border ${theme.border} ${theme.text} font-semibold hover:${theme.hoverBg} transition-colors`}>
                  Buy No - $0.35
                </button>
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <h3 className="text-xl font-semibold mb-4">Market Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Market ID</span>
                  <span>{market.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Created</span>
                  <span>Nov 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Fee</span>
                  <span>2%</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.textSecondary}>Min Bet</span>
                  <span>$1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetailPage;
