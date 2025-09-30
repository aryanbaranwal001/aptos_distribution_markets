'use client';

import Link from 'next/link';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import Navbar from '@/components/Navbar';

export default function Home() {
  const { color } = useThemeStore();
  const theme = getThemeClasses(color);

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text}`}>
      <Navbar />
      
      {/* Hero Section */}
      <main className="pt-16">
        <div className="px-12 sm:px-24 lg:px-48 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className={`text-5xl md:text-6xl font-bold ${theme.text} mb-6`}>
              Welcome to{' '}
              <span className={theme.primary}>Infi Markets</span>
            </h1>
            <p className={`text-xl ${theme.textSecondary} mb-12 max-w-2xl mx-auto`}>
              The future of prediction markets and distribution trading on the Aptos blockchain. 
              Trade on real-world events with cutting-edge technology.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                href="/trending"
                className={`px-8 py-4 rounded-lg ${theme.primaryBg} text-black font-semibold text-lg hover:opacity-90 transition-opacity`}
              >
                Explore Trending Markets
              </Link>
              <Link 
                href="/crypto"
                className={`px-8 py-4 rounded-lg border-2 ${theme.border} ${theme.text} font-semibold text-lg hover:${theme.primaryBg} hover:text-black transition-colors`}
              >
                Browse All Categories
              </Link>
            </div>
          </div>
          
          {/* Feature Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className={`p-8 rounded-lg border ${theme.border} ${theme.cardBg} text-center`}>
              <div className={`w-16 h-16 rounded-full ${theme.primaryBg} mx-auto mb-4 flex items-center justify-center`}>
                <span className="text-2xl">📊</span>
              </div>
              <h3 className={`text-xl font-semibold ${theme.text} mb-3`}>
                Distribution Markets
              </h3>
              <p className={theme.textSecondary}>
                Trade on probability distributions with advanced statistical modeling and real-time analytics.
              </p>
            </div>
            
            <div className={`p-8 rounded-lg border ${theme.border} ${theme.cardBg} text-center`}>
              <div className={`w-16 h-16 rounded-full ${theme.primaryBg} mx-auto mb-4 flex items-center justify-center`}>
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className={`text-xl font-semibold ${theme.text} mb-3`}>
                Aptos Blockchain
              </h3>
              <p className={theme.textSecondary}>
                Built on Aptos for lightning-fast transactions, low fees, and unparalleled security.
              </p>
            </div>
            
            <div className={`p-8 rounded-lg border ${theme.border} ${theme.cardBg} text-center`}>
              <div className={`w-16 h-16 rounded-full ${theme.primaryBg} mx-auto mb-4 flex items-center justify-center`}>
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className={`text-xl font-semibold ${theme.text} mb-3`}>
                Real-World Events
              </h3>
              <p className={theme.textSecondary}>
                Predict outcomes on politics, sports, technology, economics, and more global events.
              </p>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="mt-16 text-center">
            <h2 className={`text-2xl font-semibold ${theme.text} mb-8`}>
              Popular Categories
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['trending', 'crypto', 'politics', 'sports', 'tech', 'economy'].map((category) => (
                <Link
                  key={category}
                  href={`/${category}`}
                  className={`px-6 py-3 rounded-full border ${theme.border} ${theme.text} hover:${theme.primaryBg} hover:text-black transition-colors capitalize`}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
