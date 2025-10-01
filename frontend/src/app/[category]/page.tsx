'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CategoryNav from '@/components/CategoryNav';
import MarketGrid from '@/components/MarketGrid';
import { useAppStore } from '@/store/appStore';
import { isValidCategory } from '@/constants/categories';

export default function CategoryPage() {
  const params = useParams();
  const { setActiveCategory } = useAppStore();
  const category = params.category as string;

  // Check if category is valid, if not show 404
  useEffect(() => {
    if (category && !isValidCategory(category)) {
      notFound();
    }
  }, [category]);

  // Set the active category when the page loads
  useEffect(() => {
    if (category && isValidCategory(category)) {
      setActiveCategory(category);
    }
  }, [category, setActiveCategory]);

  // Don't render anything if category is invalid (will be handled by notFound())
  if (!category || !isValidCategory(category)) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <CategoryNav />
      <main className="pt-16">
        <MarketGrid key={category} />
      </main>
    </div>
  );
}
