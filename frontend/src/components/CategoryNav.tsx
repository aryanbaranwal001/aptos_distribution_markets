'use client';

import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useAppStore } from '@/store/appStore';
import { categories } from '@/data/markets';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const CategoryNav = () => {
  const { color } = useThemeStore();
  const { setActiveCategory } = useAppStore();
  const pathname = usePathname();
  
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

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  const getCurrentCategory = () => {
    if (pathname === '/') return 'trending';
    if (pathname.startsWith('/market/')) return null; // No highlight for market pages
    const pathCategory = pathname.slice(1); // Remove leading slash
    return categories.includes(pathCategory) ? pathCategory : 'trending';
  };

  const currentCategory = getCurrentCategory();

  return (
    <div className={`sticky top-16 z-40 ${theme.background} border-b ${theme.border}`}>
      <div className="px-12 sm:px-24 lg:px-48">
        <div className="flex items-center justify-center space-x-8 overflow-x-auto py-2">
          {categories.map((category) => {
            const href = category === 'trending' ? '/' : `/${category}`;
            const isActive = currentCategory === category;
            
            return (
              <Link
                key={category}
                href={href}
                onClick={() => handleCategoryClick(category)}
                className={`whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? `${theme.primary}`
                    : `${theme.textSecondary} hover:${theme.primary}`
                }`}
              >
                {categoryLabels[category]}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
