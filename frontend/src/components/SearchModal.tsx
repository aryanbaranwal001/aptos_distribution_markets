'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useAppStore } from '@/store/appStore';
import { searchMarkets, Market } from '@/data/markets';

const SearchModal = () => {
  const { color } = useThemeStore();
  const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } = useAppStore();
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

  const handleClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleResultClick = (market: Market) => {
    // Navigate to market detail (placeholder for now)
    console.log('Navigate to market:', market.id);
    handleClose();
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed z-50" style={{ 
      top: '64px', 
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 6rem)',
      maxWidth: '32rem'
    }}>
      <div className={`w-full ${theme.cardBg} rounded-lg shadow-xl border ${theme.border}`}>
        {/* Search Header */}
        <div className={`flex items-center p-4 border-b ${theme.border}`}>
          <Search className={`w-5 h-5 mr-3 ${theme.textSecondary}`} />
          <input
            type="text"
            placeholder="Search for markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 bg-transparent ${theme.text} placeholder-gray-400 outline-none`}
            autoFocus
          />
          <button
            onClick={handleClose}
            className={`p-1 ${theme.textSecondary} hover:${theme.primary} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
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
      </div>
    </div>
  );
};

export default SearchModal;
