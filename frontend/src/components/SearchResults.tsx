'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useAppStore } from '@/store/appStore';
import { searchMarkets, Market, formatVolume } from '@/data/markets';

interface SearchResultsProps {
  onClose: () => void;
}

const SearchResults = ({ onClose }: SearchResultsProps) => {
  const { color } = useThemeStore();
  const { searchQuery } = useAppStore();
  const [searchResults, setSearchResults] = useState<Market[]>([]);
  const [iconSources, setIconSources] = useState<{[key: string]: string}>({});
  const [iconErrors, setIconErrors] = useState<{[key: string]: boolean}>({});
  
  const theme = getThemeClasses(color);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchMarkets(searchQuery);
      setSearchResults(results.slice(0, 8)); // Limit to 8 results
      
      // Initialize icon sources for new results (PNG first)
      const newIconSources: {[key: string]: string} = {};
      results.slice(0, 8).forEach(market => {
        newIconSources[market.id] = `/icons/${market.iconName.replace('.svg', '.png')}`;
      });
      setIconSources(newIconSources);
      setIconErrors({});
    } else {
      setSearchResults([]);
      setIconSources({});
      setIconErrors({});
    }
  }, [searchQuery]);

  const handleResultClick = (market: Market) => {
    // Navigate to market detail (placeholder for now)
    console.log('Navigate to market:', market.id);
    onClose();
  };

  const handleImageError = (marketId: string) => {
    if (!iconErrors[marketId]) {
      setIconErrors(prev => ({ ...prev, [marketId]: true }));
      // Try SVG fallback by replacing .png with .svg
      const currentSrc = iconSources[marketId];
      const svgSrc = currentSrc.replace('.png', '.svg');
      setIconSources(prev => ({ ...prev, [marketId]: svgSrc }));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-dropdown') && !target.closest('.search-input')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="search-dropdown h-full overflow-y-auto">
      {searchResults.length > 0 ? (
        <div className="py-2">
          {searchResults.map((market) => (
            <button
              key={market.id}
              onClick={() => handleResultClick(market)}
              className={`w-full text-left px-4 py-3 ${theme.hoverBg} transition-colors flex items-center space-x-3`}
            >
              <div className="flex-shrink-0">
                <Image 
                  src={iconSources[market.id] || `/icons/${market.iconName.replace('.svg', '.png')}`}
                  alt="Market icon"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                  onError={() => handleImageError(market.id)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${theme.text} truncate`}>
                  {market.title}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className={`text-sm font-semibold ${theme.primary}`}>
                  {formatVolume(market.volume)}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : searchQuery.trim() ? (
        <div className={`p-8 text-center ${theme.textSecondary}`}>
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No markets found for &quot;{searchQuery}&quot;</p>
        </div>
      ) : (
        <div className={`p-8 text-center ${theme.textSecondary}`}>
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Start typing to search for markets...</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
