'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useAppStore } from '@/store/appStore';
import { useSearchMarkets } from '@/hooks/useMarkets';
import { Market } from '@/data/markets';

interface SearchResultsProps {
  onClose: () => void;
}

const SearchResults = ({ onClose }: SearchResultsProps) => {
  const { color } = useThemeStore();
  const { searchQuery } = useAppStore();
  const router = useRouter();
  const [iconSources, setIconSources] = useState<Record<string, string>>({});
  const [iconErrors, setIconErrors] = useState<Record<string, boolean>>({});
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const theme = getThemeClasses(color);

  const { data, loading, error } = useSearchMarkets(searchQuery, 1, 10);

  // Memoize results to prevent infinite re-renders
  const results = useMemo(() => data?.markets || [], [data?.markets]);

  useEffect(() => {
    if (searchQuery.trim() && results.length > 0) {
      const newIconSources: Record<string, string> = {};
      results.slice(0, 8).forEach(market => {
        if (market.iconName) {
          // Use PNG directly, no SVG fallback needed
          const iconName = market.iconName.replace('.svg', '.png');
          newIconSources[market.id] = `/icons/${iconName}`;
        }
      });
      setIconSources(newIconSources);
      setIconErrors({});
      setSelectedIndex(-1);
    } else {
      setIconSources({});
      setIconErrors({});
      setSelectedIndex(-1);
    }
  }, [searchQuery, results]);

  const handleResultClick = useCallback((market: Market) => {
    router.push(`/instance/${market.id}`);
    onClose();
  }, [router, onClose]);

  const handleImageError = (marketId: string) => {
    if (!iconErrors[marketId]) {
      setIconErrors(prev => ({ ...prev, [marketId]: true }));
      // Set to default icon when PNG fails to load
      setIconSources(prev => ({ ...prev, [marketId]: '/icons/default.png' }));
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (results.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => prev < results.length - 1 ? prev + 1 : prev);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            handleResultClick(results[selectedIndex]);
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
  }, [results, selectedIndex, onClose, handleResultClick]);

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

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">Search failed</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!searchQuery.trim()) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className={`${theme.textSecondary} mb-2`}>Start typing to search markets</p>
          <p className="text-sm text-gray-400">Search by title, description, or category</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-dropdown h-full overflow-y-auto">
      {results.length > 0 ? (
        <div className="py-2">
          {results.map((market, index) => (
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
                  src={iconSources[market.id] || (market.iconName ? `/icons/${market.iconName.replace('.svg', '.png')}` : '/icons/default.png')}
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
                  {/* {formatVolume(market.volume)} */}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className={`p-8 text-center ${theme.textSecondary}`}>
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No markets found for &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
