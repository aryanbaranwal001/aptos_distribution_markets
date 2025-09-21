'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useThemeStore, getThemeClasses } from '@/store/themeStore';

const MarketDetailSkeleton = () => {
  const { color } = useThemeStore();
  const theme = getThemeClasses(color);

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text}`}>
      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/" className={`${theme.textSecondary} hover:${theme.primary} mr-4`}>
            <ArrowLeft size={24} />
          </Link>
          <div className="flex items-center">
            <div className={`w-8 h-8 mr-3 rounded-full ${theme.cardBg} animate-pulse`}></div>
            <div className={`h-6 w-64 ${theme.cardBg} rounded animate-pulse`}></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Graph and Stats */}
          <div className="xl:col-span-2 space-y-6">
            {/* Graph Stats Display */}
            <div className={`p-4 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-500">X-Axis Value</div>
                  <div className={`h-6 w-12 mx-auto ${theme.background} rounded animate-pulse mt-1`}></div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Probability</div>
                  <div className={`h-6 w-16 mx-auto ${theme.background} rounded animate-pulse mt-1`}></div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Cumulative</div>
                  <div className={`h-6 w-16 mx-auto ${theme.background} rounded animate-pulse mt-1`}></div>
                </div>
              </div>
            </div>

            {/* Graph */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className={`h-6 w-48 ${theme.background} rounded animate-pulse mb-4`}></div>
              <div className="relative overflow-hidden">
                <div className={`w-full h-[300px] border rounded ${theme.background} animate-pulse flex items-center justify-center`}>
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-2 ${theme.cardBg} rounded-full animate-pulse`}></div>
                    <div className={`h-4 w-32 mx-auto ${theme.cardBg} rounded animate-pulse`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposed vs Current */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className={`h-6 w-40 ${theme.background} rounded animate-pulse mb-4`}></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className={`h-5 w-32 ${theme.background} rounded animate-pulse mb-2`}></div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className={`h-4 w-12 ${theme.background} rounded animate-pulse`}></div>
                      <div className={`h-4 w-8 ${theme.background} rounded animate-pulse`}></div>
                    </div>
                    <div className="flex justify-between">
                      <div className={`h-4 w-16 ${theme.background} rounded animate-pulse`}></div>
                      <div className={`h-4 w-8 ${theme.background} rounded animate-pulse`}></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className={`h-5 w-20 ${theme.background} rounded animate-pulse mb-2`}></div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className={`h-4 w-12 ${theme.background} rounded animate-pulse`}></div>
                      <div className={`h-4 w-16 ${theme.background} rounded animate-pulse`}></div>
                    </div>
                    <div className="flex justify-between">
                      <div className={`h-4 w-16 ${theme.background} rounded animate-pulse`}></div>
                      <div className={`h-4 w-16 ${theme.background} rounded animate-pulse`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Information */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className={`h-6 w-36 ${theme.background} rounded animate-pulse mb-4`}></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className={`h-4 w-20 ${theme.background} rounded animate-pulse`}></div>
                    <div className={`h-4 w-12 ${theme.background} rounded animate-pulse`}></div>
                  </div>
                  <div className="flex justify-between">
                    <div className={`h-4 w-24 ${theme.background} rounded animate-pulse`}></div>
                    <div className={`h-4 w-16 ${theme.background} rounded animate-pulse`}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className={`h-4 w-16 ${theme.background} rounded animate-pulse`}></div>
                    <div className={`h-4 w-16 ${theme.background} rounded animate-pulse`}></div>
                  </div>
                  <div className="flex justify-between">
                    <div className={`h-4 w-20 ${theme.background} rounded animate-pulse`}></div>
                    <div className={`h-4 w-16 ${theme.background} rounded animate-pulse`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="xl:col-span-1 space-y-6">
            {/* Mean Slider */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <div className={`h-5 w-24 ${theme.background} rounded animate-pulse`}></div>
                <div className={`h-4 w-20 ${theme.background} rounded animate-pulse`}></div>
              </div>
              <div className={`w-full h-2 ${theme.background} rounded-lg animate-pulse`}></div>
            </div>

            {/* Std Dev Slider */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <div className={`h-5 w-20 ${theme.background} rounded animate-pulse`}></div>
                <div className={`h-4 w-20 ${theme.background} rounded animate-pulse`}></div>
              </div>
              <div className={`w-full h-2 ${theme.background} rounded-lg animate-pulse`}></div>
            </div>

            {/* Collateral Required */}
            <div className={`p-4 sm:p-6 rounded-lg border ${theme.border} ${theme.cardBg}`}>
              <div className={`h-5 w-32 ${theme.background} rounded animate-pulse mb-4`}></div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className={`h-4 w-16 ${theme.background} rounded animate-pulse`}></div>
                  <div className={`h-4 w-12 ${theme.background} rounded animate-pulse`}></div>
                </div>
                <div className="flex justify-between">
                  <div className={`h-4 w-20 ${theme.background} rounded animate-pulse`}></div>
                  <div className={`h-4 w-12 ${theme.background} rounded animate-pulse`}></div>
                </div>
                <div className="flex justify-between">
                  <div className={`h-4 w-20 ${theme.background} rounded animate-pulse`}></div>
                  <div className={`h-4 w-8 ${theme.background} rounded animate-pulse`}></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className={`w-full h-12 ${theme.background} rounded-lg animate-pulse`}></div>
              <div className={`w-full h-12 ${theme.background} rounded-lg animate-pulse`}></div>
              <div className={`w-full h-12 ${theme.background} rounded-lg animate-pulse`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetailSkeleton;
