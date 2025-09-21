// Category icon mapping utility
export const getCategoryIcon = (categories: string[], title: string): string => {
  const titleLower = title.toLowerCase();
  const categoriesLower = categories.map(cat => cat.toLowerCase());
  
  // Check title for specific company mentions first (highest priority)
  if (titleLower.includes('apple') || titleLower.includes('aapl')) {
    return '/icons/apple.svg';
  }
  if (titleLower.includes('google') || titleLower.includes('googl') || titleLower.includes('alphabet')) {
    return '/icons/google.svg';
  }
  if (titleLower.includes('tesla') || titleLower.includes('tsla')) {
    return '/icons/tesla.svg';
  }
  if (titleLower.includes('microsoft') || titleLower.includes('msft')) {
    return '/icons/microsoft.svg';
  }
  if (titleLower.includes('amazon') || titleLower.includes('amzn')) {
    return '/icons/amazon.svg';
  }
  if (titleLower.includes('meta') || titleLower.includes('facebook') || titleLower.includes('fb')) {
    return '/icons/meta.svg';
  }
  if (titleLower.includes('netflix') || titleLower.includes('nflx')) {
    return '/icons/netflix.svg';
  }
  if (titleLower.includes('nvidia') || titleLower.includes('nvda')) {
    return '/icons/nvidia.svg';
  }
  if (titleLower.includes('spotify') || titleLower.includes('spot')) {
    return '/icons/spotify.svg';
  }
  if (titleLower.includes('paypal') || titleLower.includes('pypl')) {
    return '/icons/paypal.svg';
  }
  if (titleLower.includes('uber') || titleLower.includes('uber')) {
    return '/icons/uber.svg';
  }
  if (titleLower.includes('coinbase') || titleLower.includes('coin')) {
    return '/icons/coinbase.svg';
  }
  if (titleLower.includes('trump') || titleLower.includes('donald')) {
    return '/icons/trump.svg';
  }
  if (titleLower.includes('biden') || titleLower.includes('joe biden')) {
    return '/icons/biden.svg';
  }
  
  // Check title for specific crypto mentions
  if (titleLower.includes('bitcoin') || titleLower.includes('btc')) {
    return '/icons/bitcoin.svg';
  }
  if (titleLower.includes('ethereum') || titleLower.includes('eth')) {
    return '/icons/ethereum.svg';
  }
  
  // Check categories for matches (fallback)
  if (categoriesLower.includes('crypto') || categoriesLower.includes('cryptocurrency')) {
    return '/icons/bitcoin.svg';
  }
  if (categoriesLower.includes('politics') || categoriesLower.includes('political')) {
    return '/icons/politics.svg';
  }
  if (categoriesLower.includes('sports') || categoriesLower.includes('sport')) {
    return '/icons/sports.svg';
  }
  if (categoriesLower.includes('tech') || categoriesLower.includes('technology')) {
    return '/icons/tech.svg';
  }
  if (categoriesLower.includes('economy') || categoriesLower.includes('economic')) {
    return '/icons/economy.svg';
  }
  if (categoriesLower.includes('elections') || categoriesLower.includes('election')) {
    return '/icons/elections.svg';
  }
  if (categoriesLower.includes('world') || categoriesLower.includes('global')) {
    return '/icons/world.svg';
  }
  if (categoriesLower.includes('earnings') || categoriesLower.includes('financial')) {
    return '/icons/earnings.svg';
  }
  if (categoriesLower.includes('geopolitics') || categoriesLower.includes('geopolitical')) {
    return '/icons/geopolitics.svg';
  }
  
  // Default fallback
  return '/icons/world.svg';
};
