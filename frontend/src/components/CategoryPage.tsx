'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import MarketGrid from '@/components/MarketGrid';

interface CategoryPageProps {
  category: string;
}

const CategoryPage = ({ category }: CategoryPageProps) => {
  const { setActiveCategory } = useAppStore();

  useEffect(() => {
    setActiveCategory(category);
  }, [category, setActiveCategory]);

  return <MarketGrid />;
};

export default CategoryPage;
