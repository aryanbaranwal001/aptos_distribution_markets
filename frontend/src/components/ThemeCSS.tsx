'use client';

import { useThemeStore } from '@/store/themeStore';
import { useEffect } from 'react';

const ThemeCSS = () => {
  const { color } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Define theme colors for wallet selector
    const themeColors = {
      blue: {
        primaryBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        primaryHover: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        primaryShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      },
      purple: {
        primaryBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        primaryHover: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        primaryShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
      },
      green: {
        primaryBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        primaryHover: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        primaryShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
      orange: {
        primaryBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        primaryHover: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
        primaryShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
      },
      red: {
        primaryBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        primaryHover: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        primaryShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      },
    };

    const currentTheme = themeColors[color as keyof typeof themeColors];
    
    if (currentTheme) {
      root.style.setProperty('--theme-primary-bg', currentTheme.primaryBg);
      root.style.setProperty('--theme-primary-hover', currentTheme.primaryHover);
      root.style.setProperty('--theme-primary-shadow', currentTheme.primaryShadow);
    }
  }, [color]);

  return null; // This component doesn't render anything
};

export default ThemeCSS;
