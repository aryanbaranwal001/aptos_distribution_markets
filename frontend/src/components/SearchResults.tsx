'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useAppStore } from '@/store/appStore';
import { searchMarkets, Market } from '@/data/markets';

interface SearchResultsProps {
  onClose: () => void;
}

const SearchResults = ({ onClose }: SearchResultsProps) => {
  const { color } = useThemeStore();
  const { searchQuery } = useAppStore();
  const [searchResults, setSearchResults] = useState<Market[]>([]);
  
  const theme = getThemeClasses(color);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchMarkets(searchQuery);
      setSearchResults(results.slice(0, 8)); // Limit to 8 results
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleResultClick = (market: Market) => {
    // Navigate to market detail (placeholder for now)
    console.log('Navigate to market:', market.id);
    onClose();
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
              className={`w-full text-left px-4 py-3 ${theme.hoverBg} transition-colors`}
            >
              <div className={`font-medium ${theme.text} mb-1`}>
                {market.title}
              </div>
              <div className={`text-sm ${theme.textSecondary} line-clamp-2`}>
                {market.description}
              </div>
              <div className="flex items-center mt-2 space-x-2">
                {market.categories.slice(0, 3).map((category) => (
                  <span
                    key={category}
                    className={`px-2 py-1 text-xs rounded-full ${theme.primaryBg} text-white`}
                  >
                    {category}
                  </span>
                ))}
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
