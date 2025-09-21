'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { getMarketsByCategory, Market } from '@/data/markets';
import MarketCard from './MarketCard';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';

const MarketGrid = () => {
  const { activeCategory } = useAppStore();
  const { color } = useThemeStore();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  
  const theme = getThemeClasses(color);

  useEffect(() => {
    setLoading(true);
    // Simulate loading delay
    const timer = setTimeout(() => {
      const categoryMarkets = getMarketsByCategory(activeCategory);
      setMarkets(categoryMarkets);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [activeCategory]);

  const categoryLabels: Record<string, string> = {
    trending: 'Trending',
    new: 'New',
    politics: 'Politics',
    sports: 'Sports',
    crypto: 'Crypto',
    earnings: 'Earnings',
    geopolitics: 'Geopolitics',
    tech: 'Tech',
    world: 'World',
    economy: 'Economy',
    elections: 'Elections',
  };

  if (loading) {
    return (
      <div className="px-12 sm:px-24 lg:px-48 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg} animate-pulse`}
            >
              <div className="h-6 bg-gray-600 rounded mb-3"></div>
              <div className="h-4 bg-gray-600 rounded mb-2"></div>
              <div className="h-4 bg-gray-600 rounded mb-4 w-3/4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-16 bg-gray-600 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-600 rounded-full"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-8 w-20 bg-gray-600 rounded"></div>
                <div className="h-8 w-8 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-12 sm:px-24 lg:px-48 py-8">
      <div className="mb-8">
        <h2 className={`text-2xl font-bold ${theme.text} mb-2`}>
          {categoryLabels[activeCategory]} Markets
        </h2>
        <p className={`${theme.textSecondary}`}>
          {markets.length} market{markets.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {markets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 ${theme.textSecondary}`}>
          <p className="text-lg mb-2">No markets found</p>
          <p>Check back later for new markets in this category.</p>
        </div>
      )}
    </div>
  );
};

export default MarketGrid;
