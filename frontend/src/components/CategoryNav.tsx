'use client';

import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { CATEGORIES, CATEGORY_LABELS, isValidCategory } from '@/constants/categories';
import { useEffect } from 'react';

const CategoryNav = () => {
  const { color } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();
  const { activeCategory, setActiveCategory } = useAppStore();
  
  const theme = getThemeClasses(color);
  
  // Use shared category constants
  const categories = CATEGORIES;
  
  // Check if we're on an instance page
  const isInstancePage = pathname?.startsWith('/instance/');
  
  // Update store when URL changes
  useEffect(() => {
    // Determine current active category based on URL
    const getCurrentCategory = () => {
      if (pathname === '/' || pathname === '/trending') return 'trending';
      const pathCategory = pathname?.slice(1); // Remove leading slash
      return pathCategory && isValidCategory(pathCategory) ? pathCategory : 'trending';
    };
    
    const urlCategory = getCurrentCategory();
    console.log('CategoryNav: URL changed to:', pathname, 'detected category:', urlCategory, 'current store category:', activeCategory);
    
    if (urlCategory !== activeCategory) {
      console.log('CategoryNav: Updating store category from', activeCategory, 'to', urlCategory);
      setActiveCategory(urlCategory);
    }
  }, [pathname, activeCategory, setActiveCategory]);

  // Use shared category labels
  const categoryLabels = CATEGORY_LABELS;

  const handleCategoryClick = (category: string) => {
    if (category === 'trending') {
      // Trending goes to the trending page
      router.push('/trending');
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
              {categoryLabels[category] || category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
