'use client';

import Navbar from '@/components/Navbar';
import CategoryNav from '@/components/CategoryNav';
import MarketGrid from '@/components/MarketGrid';

export default function TrendingPage() {
  // Note: CategoryNav now handles setting the active category based on URL
  // No need to set it here to avoid conflicts

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
