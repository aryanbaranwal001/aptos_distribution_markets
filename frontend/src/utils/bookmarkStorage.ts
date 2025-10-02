export interface BookmarkedMarket {
  id: string;
  title: string;
  description: string;
  volume: number;
  categories: string[];
  iconName?: string;
  bookmarkedAt: number; // timestamp
}

const BOOKMARK_STORAGE_KEY = 'aptos_distribution_markets_bookmarks';

export const bookmarkStorage = {
  // Get all bookmarked markets
  getBookmarks(): BookmarkedMarket[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading bookmarks from localStorage:', error);
      return [];
    }
  },

  // Add a market to bookmarks
  addBookmark(market: Omit<BookmarkedMarket, 'bookmarkedAt'>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const bookmarks = this.getBookmarks();
      const existingIndex = bookmarks.findIndex(b => b.id === market.id);
      
      if (existingIndex === -1) {
        const newBookmark: BookmarkedMarket = {
          ...market,
          bookmarkedAt: Date.now()
        };
        bookmarks.unshift(newBookmark); // Add to beginning for recent-first order
        localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
      }
    } catch (error) {
      console.error('Error adding bookmark to localStorage:', error);
    }
  },

  // Remove a market from bookmarks
  removeBookmark(marketId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const bookmarks = this.getBookmarks();
      const filtered = bookmarks.filter(b => b.id !== marketId);
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing bookmark from localStorage:', error);
    }
  },

  // Check if a market is bookmarked
  isBookmarked(marketId: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.id === marketId);
  },

  // Clear all bookmarks
  clearBookmarks(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(BOOKMARK_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing bookmarks from localStorage:', error);
    }
  }
};
