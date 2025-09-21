'use client';

import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useAppStore } from '@/store/appStore';
import { categories } from '@/data/markets';

const CategoryNav = () => {
  const { color } = useThemeStore();
  const { activeCategory, setActiveCategory } = useAppStore();
  
  const theme = getThemeClasses(color);

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

  return (
    <div className={`sticky top-16 z-40 ${theme.background} border-b ${theme.border}`}>
      <div className="px-12 sm:px-24 lg:px-48">
        <div className="flex items-center justify-center space-x-8 overflow-x-auto py-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === category
                  ? `${theme.primary}`
                  : `${theme.textSecondary} hover:${theme.primary}`
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
