'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CategoryNav from '@/components/CategoryNav';
import MarketGrid from '@/components/MarketGrid';
import { categories } from '@/data/markets';
import { useAppStore } from '@/store/appStore';

export default function CategoryPage() {
  const params = useParams();
  const { setActiveCategory } = useAppStore();
  const category = params.category as string;

  // Set the active category when the page loads
  useEffect(() => {
    if (category && categories.includes(category)) {
      setActiveCategory(category);
    } else {
      // If invalid category, default to trending
      setActiveCategory('trending');
    }
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
}
