'use client';

import Link from 'next/link';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';
import Navbar from '@/components/Navbar';

export default function NotFound() {
  const { color } = useThemeStore();
  const theme = getThemeClasses(color);

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text}`}>
      <Navbar />
      <div className="flex items-center justify-center pt-32">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <h1 className={`text-8xl font-bold ${theme.primary} mb-4`}>404</h1>
            <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
            <p className={`${theme.textSecondary} mb-8`}>
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/" 
              className={`inline-block px-6 py-3 rounded-lg ${theme.primaryBg} text-black font-semibold hover:opacity-90 transition-opacity`}
            >
              Go Home
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link 
                href="/trending" 
                className={`px-4 py-2 rounded-lg border ${theme.border} ${theme.text} hover:${theme.primaryBg} hover:text-black transition-colors`}
              >
                View Trending Markets
              </Link>
              <Link 
                href="/crypto" 
                className={`px-4 py-2 rounded-lg border ${theme.border} ${theme.text} hover:${theme.primaryBg} hover:text-black transition-colors`}
              >
                Browse Crypto Markets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
