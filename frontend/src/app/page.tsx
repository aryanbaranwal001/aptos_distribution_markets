'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import MarketGrid from '@/components/MarketGrid';

export default function Home() {
  const { setActiveCategory } = useAppStore();

  useEffect(() => {
    setActiveCategory('trending');
  }, [setActiveCategory]);

  return <MarketGrid />;
}
