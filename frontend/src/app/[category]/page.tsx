'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CategoryNav from '@/components/CategoryNav';
import MarketGrid from '@/components/MarketGrid';
import { useCategories } from '@/hooks/useMarkets';
import { useAppStore } from '@/store/appStore';

export default function CategoryPage() {
  const params = useParams();
  const { setActiveCategory } = useAppStore();
  const category = params.category as string;
  const { data: categories = [], loading } = useCategories();

  // Check if category is valid, if not show 404
  useEffect(() => {
    if (!loading && category && categories.length > 0 && !categories.includes(category)) {
      notFound();
    }
  }, [category, categories, loading]);

  // Set the active category when the page loads
  useEffect(() => {
    if (category && categories.includes(category)) {
      setActiveCategory(category);
    }
  }, [category, setActiveCategory, categories]);

  // Show loading state while fetching categories
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <CategoryNav />
        <main className="pt-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        </main>
      </div>
    );
  }

  // Don't render anything if category is invalid (will be handled by notFound())
  if (!category || (categories.length > 0 && !categories.includes(category))) {
    return null;
  }

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
