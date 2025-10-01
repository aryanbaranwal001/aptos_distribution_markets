// Fixed category order and labels for consistent navigation
export const CATEGORIES: string[] = [
  'trending', 'new', 'politics', 'sports', 'crypto', 
  'earnings', 'geopolitics', 'tech', 'world', 'economy', 'elections'
];

export const CATEGORY_LABELS: Record<string, string> = {
  trending: 'Trending',
  new: 'New',
  politics: 'Politics',
  sports: 'Sports',
  crypto: 'Crypto',
  earnings: 'Earnings',
  geopolitics: 'Geopolitics',
  tech: 'Tech',
  world: 'World',
  economy: 'Economy',
  elections: 'Elections',
};

// Helper function to check if a string is a valid category
export const isValidCategory = (category: string): boolean => {
  return CATEGORIES.includes(category);
};
