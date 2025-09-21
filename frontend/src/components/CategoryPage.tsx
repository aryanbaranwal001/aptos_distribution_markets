'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import Navbar from '@/components/Navbar';
import CategoryNav from '@/components/CategoryNav';
import MarketGrid from '@/components/MarketGrid';

interface CategoryPageProps {
  category: string;
}

const CategoryPage = ({ category }: CategoryPageProps) => {
  const { setActiveCategory } = useAppStore();

  useEffect(() => {
    setActiveCategory(category);
  }, [category, setActiveCategory]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <CategoryNav />
      <main className="pt-16">
        <MarketGrid />
      </main>
    </div>
  );
};

export default CategoryPage;
