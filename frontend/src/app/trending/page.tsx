'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CategoryNav from '@/components/CategoryNav';
import MarketGrid from '@/components/MarketGrid';
import { useAppStore } from '@/store/appStore';

export default function TrendingPage() {
  const { setActiveCategory } = useAppStore();

  // Set trending as the active category
  useEffect(() => {
    setActiveCategory('trending');
  }, [setActiveCategory]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <CategoryNav />
      <main className="pt-16">
        <MarketGrid key="trending" />
      </main>
    </div>
  );
}
