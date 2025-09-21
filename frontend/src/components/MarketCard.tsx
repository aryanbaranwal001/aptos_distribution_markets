'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { Market, formatVolume } from '@/data/markets';

interface MarketCardProps {
  market: Market;
}

const MarketCard = ({ market }: MarketCardProps) => {
  const { color } = useThemeStore();
  const [isBookmarked, setIsBookmarked] = useState(market.isBookmarked || false);
  
  const theme = getThemeClasses(color);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleCardClick = () => {
    // Navigate to market detail (placeholder for now)
    console.log('Navigate to market:', market.id);
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div
      onClick={handleCardClick}
      className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg} hover:shadow-lg transition-all duration-200 cursor-pointer group`}
    >
      {/* Market Title */}
      <h3 className={`text-lg font-semibold ${theme.text} mb-3 group-hover:${theme.primary} transition-colors`}>
        {market.title}
      </h3>

      {/* Market Description */}
      <p className={`${theme.textSecondary} mb-4 leading-relaxed`}>
        {truncateDescription(market.description)}
      </p>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {market.categories.slice(0, 3).map((category) => (
          <span
            key={category}
            className={`px-2 py-1 text-xs rounded-full ${theme.cardBg} border ${theme.border} ${theme.textSecondary}`}
          >
            {category}
          </span>
        ))}
      </div>

      {/* Bottom Section - Volume and Bookmark */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className={`text-xs ${theme.textSecondary} mb-1`}>Volume</span>
          <span className={`text-lg font-semibold ${theme.primary}`}>
            {formatVolume(market.volume)}
          </span>
        </div>

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
    </div>
  );
};

export default MarketCard;
