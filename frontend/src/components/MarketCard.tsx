'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { Market, formatVolume } from '@/data/markets';
import BookmarkIcon from './BookmarkIcon';

interface MarketCardProps {
  market: Market;
}

const MarketCard = ({ market }: MarketCardProps) => {
  const { color } = useThemeStore();
  const [isBookmarked, setIsBookmarked] = useState(market.isBookmarked || false);
  // Start with PNG first, then fallback to SVG
  const [iconSrc, setIconSrc] = useState(`/icons/${market.iconName.replace('.svg', '.png')}`);
  const [hasError, setHasError] = useState(false);
  
  const theme = getThemeClasses(color);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    // Handle category filter (placeholder for now)
    console.log('Filter by category:', category);
  };

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      // Try SVG fallback by replacing .png with .svg
      const svgSrc = iconSrc.replace('.png', '.svg');
      setIconSrc(svgSrc);
    }
  };


  return (
    <div
      className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg} hover:shadow-lg transition-all duration-200 group flex flex-col h-full`}
    >
      {/* Icon and Market Title */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="flex-shrink-0">
          <Image 
            src={iconSrc}
            alt="Market icon"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
            onError={handleImageError}
          />
        </div>
        <Link href={`/${market.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}>
          <h3 className={`text-lg font-semibold ${theme.text} hover:${theme.primary} hover:underline transition-all flex-1 cursor-pointer`}>
            {market.title}
          </h3>
        </Link>
      </div>

      {/* Market Description */}
      <p className={`${theme.textSecondary} mb-4 leading-relaxed line-clamp-2`}>
        {market.description}
      </p>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {market.categories.slice(0, 3).map((category) => (
          <span
            key={category}
            onClick={(e) => handleCategoryClick(e, category)}
            className={`px-2 py-1 text-xs rounded-full ${theme.cardBg} border ${theme.border} ${theme.textSecondary} cursor-pointer hover:${theme.primary} transition-colors`}
          >
            {category}
          </span>
        ))}
      </div>

      {/* Bottom Section - Volume and Bookmark */}
      <div className="flex items-center justify-between mt-auto -mb-2 sm:-mb-3 lg:-mb-4">
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
    </div>
  );
};

export default MarketCard;
