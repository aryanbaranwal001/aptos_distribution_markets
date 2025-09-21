'use client';

import { useThemeStore, getThemeClasses } from '@/store/themeStore';

export default function Dashboard() {
  const { color, mode } = useThemeStore();
  const theme = getThemeClasses(color, mode);

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text}`}>
      <div className="pt-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-3xl font-bold ${theme.primary} mb-8`}>
            Dashboard
          </h1>
          <div className={`p-8 rounded-lg border border-gray-200 dark:border-gray-700 ${theme.background}`}>
            <p className={`text-lg ${theme.textSecondary}`}>
              Dashboard functionality will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
