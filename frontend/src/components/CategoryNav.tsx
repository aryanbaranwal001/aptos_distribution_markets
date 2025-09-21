'use client';

import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useAppStore } from '@/store/appStore';
import { categories } from '@/data/markets';

const CategoryNav = () => {
  const { color, mode } = useThemeStore();
  const { activeCategory, setActiveCategory } = useAppStore();
  
  const theme = getThemeClasses(color, mode);

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
    <div className={`sticky top-16 z-40 ${theme.background} border-b border-gray-200 dark:border-gray-800`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8 overflow-x-auto py-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap pb-2 border-b-2 transition-colors ${
                activeCategory === category
                  ? `${theme.primary} border-current`
                  : `${theme.textSecondary} border-transparent hover:${theme.primary}`
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
