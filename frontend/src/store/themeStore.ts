import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColor = 'green' | 'orange' | 'coral';

interface ThemeState {
  color: ThemeColor;
  setColor: (color: ThemeColor) => void;
  nextColor: () => void;
}

const themeColors: ThemeColor[] = ['green', 'orange', 'coral'];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      color: 'green',
      setColor: (color) => set({ color }),
      nextColor: () => {
        const currentIndex = themeColors.indexOf(get().color);
        const nextIndex = (currentIndex + 1) % themeColors.length;
        set({ color: themeColors[nextIndex] });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

export const getThemeClasses = (color: ThemeColor) => {
  const baseClasses = {
    background: 'bg-[#0a0b0d]',
    text: 'text-[#fffffa]',
    textSecondary: 'text-gray-300',
    cardBg: 'bg-[#1a1b1e]',
    searchBg: 'bg-[#2a2b2e]',
    border: 'border-[#2a2b2e]',
    searchBorder: 'border-[#1a1b1e]',
    hoverBg: 'hover:bg-[#2a2b2e]',
  };

  const colorClasses = {
    green: {
      primary: 'text-[#11b881]',
      primaryBg: 'bg-[#11b881]',
      primaryHover: 'hover:bg-[#0f9d6f]',
      border: 'border-[#11b881]',
      accent: 'accent-[#11b881]',
    },
    orange: {
      primary: 'text-[#e59500]',
      primaryBg: 'bg-[#e59500]',
      primaryHover: 'hover:bg-[#cc8500]',
      border: 'border-[#e59500]',
      accent: 'accent-[#e59500]',
    },
    coral: {
      primary: 'text-[#ef2d56]',
      primaryBg: 'bg-[#ef2d56]',
      primaryHover: 'hover:bg-[#d92548]',
      border: 'border-[#ef2d56]',
      accent: 'accent-[#ef2d56]',
    },
  };

  return {
    ...baseClasses,
    ...colorClasses[color],
  };
};
