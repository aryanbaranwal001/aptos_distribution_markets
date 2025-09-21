'use client';

import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useAppStore } from '@/store/appStore';
import { categories } from '@/data/markets';
import { useRouter, usePathname } from 'next/navigation';

const CategoryNav = () => {
  const { color } = useThemeStore();
  const { activeCategory, setActiveCategory } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const theme = getThemeClasses(color);
  
  // Check if we're on an instance page
  const isInstancePage = pathname?.startsWith('/instance/');

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

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    // If we're on an instance page, navigate back to home with the selected category
    if (isInstancePage) {
      router.push('/');
    }
  };

  return (
    <div className={`sticky top-16 z-40 ${theme.background} border-b ${theme.border}`}>
      <div className="px-12 sm:px-24 lg:px-48">
        <div className="flex items-center justify-center space-x-8 overflow-x-auto py-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`whitespace-nowrap transition-colors cursor-pointer ${
                !isInstancePage && activeCategory === category
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
