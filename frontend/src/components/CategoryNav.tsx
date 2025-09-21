'use client';

import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { categories } from '@/data/markets';
import { useRouter, usePathname } from 'next/navigation';

const CategoryNav = () => {
  const { color } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const theme = getThemeClasses(color);
  
  // Check if we're on an instance page
  const isInstancePage = pathname?.startsWith('/instance/');
  
  // Determine current active category based on URL
  const getCurrentCategory = () => {
    if (pathname === '/') return 'trending';
    const pathCategory = pathname?.slice(1); // Remove leading slash
    return categories.includes(pathCategory || '') ? pathCategory : 'trending';
  };
  
  const activeCategory = getCurrentCategory();

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
    if (category === 'trending') {
      // Trending goes to the home page
      router.push('/');
    } else {
      // Other categories go to their specific routes
      router.push(`/${category}`);
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
