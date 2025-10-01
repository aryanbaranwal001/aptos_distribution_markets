import { create } from 'zustand';

interface AppState {
  activeCategory: string;
  isSearchOpen: boolean;
  searchQuery: string;
  setActiveCategory: (category: string) => void;
  setSearchOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeCategory: 'trending',
  isSearchOpen: false,
  searchQuery: '',
  setActiveCategory: (category) => {
    // Only update if category actually changed to prevent unnecessary re-renders
    if (get().activeCategory !== category) {
      set({ activeCategory: category });
    }
  },
  setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
