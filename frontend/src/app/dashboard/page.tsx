'use client';

import { useState, useEffect } from 'react';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { bookmarkStorage, BookmarkedMarket } from '@/utils/bookmarkStorage';
import Navbar from '@/components/Navbar';
import CategoryNav from '@/components/CategoryNav';
import Image from 'next/image';
import Link from 'next/link';
import { formatVolume } from '@/utils/formatters';
import BookmarkIcon from '@/components/BookmarkIcon';
import { Bookmark } from 'lucide-react';

export default function Dashboard() {
  const { color } = useThemeStore();
  const theme = getThemeClasses(color);
  const [bookmarkedMarkets, setBookmarkedMarkets] = useState<BookmarkedMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load bookmarked markets
    const bookmarks = bookmarkStorage.getBookmarks();
    setBookmarkedMarkets(bookmarks);
    setLoading(false);
  }, []);

  const handleRemoveBookmark = (marketId: string) => {
    bookmarkStorage.removeBookmark(marketId);
    setBookmarkedMarkets(prev => prev.filter(market => market.id !== marketId));
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.background} ${theme.text}`}>
        <Navbar />
        <CategoryNav />
        <div className="flex items-center justify-center pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text}`}>
      <Navbar />
      <CategoryNav />
      
      <div className="pt-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <h1 className={`text-3xl font-bold ${theme.text}`}>
              My Dashboard
            </h1>
          </div>

          {/* Bookmarked Markets Section */}
          <div className="mb-12">
            <h2 className={`text-xl font-semibold ${theme.text} mb-6`}>
              Bookmarked Markets ({bookmarkedMarkets.length})
            </h2>
            
            {bookmarkedMarkets.length === 0 ? (
              <div className={`p-12 rounded-lg border ${theme.border} ${theme.cardBg} text-center`}>
                <Bookmark className={`w-16 h-16 ${theme.textSecondary} mx-auto mb-4`} />
                <h3 className={`text-lg font-medium ${theme.text} mb-2`}>
                  No bookmarked markets yet
                </h3>
                <p className={`${theme.textSecondary} mb-6`}>
                  Start bookmarking markets you&apos;re interested in to see them here.
                </p>
                <Link 
                  href="/trending"
                  className={`inline-flex items-center px-6 py-3 rounded-lg ${theme.primaryBg} text-black font-medium hover:opacity-90 transition-opacity`}
                >
                  Explore Markets
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedMarkets.map((market) => (
                  <BookmarkedMarketCard 
                    key={market.id} 
                    market={market} 
                    theme={theme}
                    onRemoveBookmark={handleRemoveBookmark}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BookmarkedMarketCardProps {
  market: BookmarkedMarket;
  theme: ReturnType<typeof getThemeClasses>;
  onRemoveBookmark: (marketId: string) => void;
}

function BookmarkedMarketCard({ market, theme, onRemoveBookmark }: BookmarkedMarketCardProps) {
  const [iconSrc, setIconSrc] = useState(
    market.iconName ? `/icons/${market.iconName.replace('.svg', '.png')}` : '/icons/default.png'
  );
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setIconSrc('/icons/default.png');
    }
  };

  const handleRemoveBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveBookmark(market.id);
  };

  return (
    <div className={`p-6 rounded-lg border ${theme.border} ${theme.cardBg} hover:shadow-lg transition-all duration-200 group flex flex-col h-full`}>
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
        <Link href={`/instance/${market.id}`}>
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
            className={`px-2 py-1 text-xs rounded-full ${theme.cardBg} border ${theme.border} ${theme.textSecondary}`}
          >
            {category}
          </span>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className={`text-xs ${theme.textSecondary} mb-1`}>Volume</span>
            <span className={`text-lg font-semibold ${theme.primary}`}>
              {formatVolume(market.volume)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${theme.textSecondary}`}>
              Bookmarked {new Date(market.bookmarkedAt).toLocaleDateString()}
            </span>
            <button
              onClick={handleRemoveBookmark}
              className={`p-2 rounded-full transition-colors ${theme.textSecondary} hover:${theme.primary}`}
              title="Remove bookmark"
            >
              <BookmarkIcon 
                filled={true} 
                className="w-5 h-5"
                themeColor={theme.primary}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
