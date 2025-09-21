'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useAppStore } from '@/store/appStore';
import { searchMarkets, Market, formatVolume } from '@/data/markets';

interface SearchResultsProps {
  onClose: () => void;
}

const SearchResults = ({ onClose }: SearchResultsProps) => {
  const { color } = useThemeStore();
  const { searchQuery } = useAppStore();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<Market[]>([]);
  const [iconSources, setIconSources] = useState<{[key: string]: string}>({});
  const [iconErrors, setIconErrors] = useState<{[key: string]: boolean}>({});
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
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
      setSelectedIndex(-1);
    } else {
      setSearchResults([]);
      setIconSources({});
      setIconErrors({});
      setSelectedIndex(-1);
    }
  }, [searchQuery]);

  const handleResultClick = useCallback((market: Market) => {
    // Generate the same slug as MarketCard component
    const slug = market.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    router.push(`/${slug}`);
    onClose();
  }, [router, onClose]);

  const handleImageError = (marketId: string) => {
    if (!iconErrors[marketId]) {
      setIconErrors(prev => ({ ...prev, [marketId]: true }));
      // Try SVG fallback by replacing .png with .svg
      const currentSrc = iconSources[marketId];
      const svgSrc = currentSrc.replace('.png', '.svg');
      setIconSources(prev => ({ ...prev, [marketId]: svgSrc }));
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (searchResults.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            handleResultClick(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchResults, selectedIndex, onClose, handleResultClick]);

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
          {searchResults.map((market, index) => (
            <button
              key={market.id}
              onClick={() => handleResultClick(market)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-3 transition-colors flex items-center space-x-3 ${
                selectedIndex === index 
                  ? `bg-gray-700/30` 
                  : `hover:bg-gray-700/20`
              }`}
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
