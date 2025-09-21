import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColor = 'green' | 'orange' | 'coral' | 'blue';
export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  color: ThemeColor;
  mode: ThemeMode;
  setColor: (color: ThemeColor) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  nextColor: () => void;
}

const themeColors: ThemeColor[] = ['green', 'orange', 'coral', 'blue'];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      color: 'green',
      mode: 'dark',
      setColor: (color) => set({ color }),
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
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

export const getThemeClasses = (color: ThemeColor, mode: ThemeMode) => {
  const baseClasses = {
    background: mode === 'dark' ? 'bg-[#0a0b0d]' : 'bg-[#fffffa]',
    text: mode === 'dark' ? 'text-[#fffffa]' : 'text-[#0a0b0d]',
    textSecondary: mode === 'dark' ? 'text-gray-300' : 'text-gray-600',
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
      primary: 'text-[#eb9486]',
      primaryBg: 'bg-[#eb9486]',
      primaryHover: 'hover:bg-[#e6826f]',
      border: 'border-[#eb9486]',
      accent: 'accent-[#eb9486]',
    },
    blue: {
      primary: 'text-blue-500',
      primaryBg: 'bg-blue-500',
      primaryHover: 'hover:bg-blue-600',
      border: 'border-blue-500',
      accent: 'accent-blue-500',
    },
  };

  return {
    ...baseClasses,
    ...colorClasses[color],
  };
};
