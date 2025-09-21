'use client';

import { useThemeStore } from '@/store/themeStore';
import { useEffect } from 'react';

const ThemeCSS = () => {
  const { color } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Define theme colors for wallet selector
    const themeColors = {
      green: {
        primaryBg: 'linear-gradient(135deg, #11b881 0%, #0f9d6f 100%)',
        primaryHover: 'linear-gradient(135deg, #0f9d6f 0%, #0d8660 100%)',
        primaryShadow: '0 4px 12px rgba(17, 184, 129, 0.3)',
      },
      orange: {
        primaryBg: 'linear-gradient(135deg, #e59500 0%, #cc8500 100%)',
        primaryHover: 'linear-gradient(135deg, #cc8500 0%, #b37400 100%)',
        primaryShadow: '0 4px 12px rgba(229, 149, 0, 0.3)',
      },
      coral: {
        primaryBg: 'linear-gradient(135deg, #ef2d56 0%, #d92548 100%)',
        primaryHover: 'linear-gradient(135deg, #d92548 0%, #c21e3a 100%)',
        primaryShadow: '0 4px 12px rgba(239, 45, 86, 0.3)',
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
