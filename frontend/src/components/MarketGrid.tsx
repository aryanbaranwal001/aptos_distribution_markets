'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { useMarkets } from '@/hooks/useMarkets';
import MarketCard from './MarketCard';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';

const MarketGrid = () => {
  const { activeCategory } = useAppStore();
  const { color } = useThemeStore();
  const [page, setPage] = useState(1);
  const limit = 20;
  
  const theme = getThemeClasses(color);
  
  // Use the new API hook
  const { data, loading, error } = useMarkets({
    category: activeCategory === 'all' ? undefined : activeCategory,
    page,
    limit,
    sort: 'volume',
    order: 'desc'
  });
  
  const markets = data?.markets || [];
  const pagination = data?.pagination;

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
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

  if (error) {
    return (
      <div className="px-12 sm:px-24 lg:px-48 py-8">
        <div className={`text-center py-12 ${theme.textSecondary}`}>
          <p className="text-lg mb-2 text-red-400">Error loading markets</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={`mt-4 px-4 py-2 rounded-lg ${theme.primaryBg} text-black font-semibold hover:opacity-90 transition-opacity`}
          >
            Retry
          </button>
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
          {pagination?.totalCount || 0} market{(pagination?.totalCount || 0) !== 1 ? 's' : ''} available
          {pagination && pagination.totalPages > 1 && (
            <span> • Page {pagination.currentPage} of {pagination.totalPages}</span>
          )}
        </p>
      </div>

      {markets.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrevPage}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  pagination.hasPrevPage
                    ? `${theme.border} ${theme.text} hover:${theme.primaryBg} hover:text-black`
                    : 'border-gray-600 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              
              <span className={`${theme.textSecondary}`}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  pagination.hasNextPage
                    ? `${theme.border} ${theme.text} hover:${theme.primaryBg} hover:text-black`
                    : 'border-gray-600 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
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
