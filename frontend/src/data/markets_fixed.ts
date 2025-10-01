export interface Market {
  id: string;
  title: string;
  description: string;
  volume: number;
  categories: string[];
  iconName: string;
  address: string;
  startDate: string;
  endDate: string;
  isBookmarked?: boolean;
  market_mean: number;
  market_mean_min: number;
  market_mean_max: number;
  market_standard_deviation: number;
  market_standard_deviation_min: number;
  market_standard_deviation_max: number;
  min_sigma: number;
  Lambda: number;
  peak_p: number;
  headroom: number;
  s: number;
  mu_per_one: number;
  sigma_per_one: number;
  x_axis_field_name: string;
  x_axis_short_form: string;
  aicontext: string;
}

export const markets: Market[] = [
  {
    id: "1",
    title: "Will Aptos APT reach $8 by end of December 2025?",
    description: "Distribution market on Aptos APT token price considering chain's adoption of innovative projects, developer activity, and overall crypto market conditions.",
    volume: 1850000,
    categories: ["trending","crypto", "tech"],
    iconName: "aptos.svg",
    address: "0xa0bcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789",
    startDate: "2024-10-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z",
    market_mean: 12.5,
    market_mean_min: 8.0,
    market_mean_max: 17.0,
    market_standard_deviation: 3.2,
    market_standard_deviation_min: 2.0,
    market_standard_deviation_max: 4.4,
    min_sigma: 2.0,
    Lambda: 0.95,
    peak_p: 0.55,
    headroom: 0.45,
    s: 1.15,
    mu_per_one: 0.83,
    sigma_per_one: 0.21,
    x_axis_field_name: "APT Price (USD)",
    x_axis_short_form: "APT Price",
    aicontext: "This is a distribution market for Aptos (APT) token price prediction. APT is the native token of the Aptos blockchain, a Layer 1 blockchain focused on safety and scalability. The market is asking whether APT will reach $8 by the end of December 2025. Current factors affecting APT price include: blockchain adoption, developer ecosystem growth, DeFi protocols built on Aptos, institutional partnerships, and overall crypto market sentiment. The distribution shows the probability of different price outcomes, with users able to trade on their predictions about APT's future value."
  },

  {
    id: "2",
    title: "Will Bitcoin reach $100,000 by end of 2024?",
    description: "Prediction market on Bitcoin's price trajectory considering current market conditions, institutional adoption, and regulatory developments.",
    volume: 2500000,
    categories: ["trending", "crypto"],
    iconName: "bitcoin.svg",
    address: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
    startDate: "2024-01-15T10:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
    market_mean: 75000,
    market_mean_min: 50000,
    market_mean_max: 100000,
    market_standard_deviation: 15000,
    market_standard_deviation_min: 8000,
    market_standard_deviation_max: 22000,
    min_sigma: 2.5,
    Lambda: 0.8,
    peak_p: 0.65,
    headroom: 0.35,
    s: 1.2,
    mu_per_one: 0.75,
    sigma_per_one: 0.15,
    x_axis_field_name: "Bitcoin Price (USD)",
    x_axis_short_form: "BTC Price",
    aicontext: "This is a distribution market predicting whether Bitcoin (BTC) will reach $100,000 by the end of 2024. Bitcoin is the world's first and largest cryptocurrency by market cap. Key factors influencing Bitcoin's price include: institutional adoption, regulatory developments, macroeconomic conditions, inflation hedging demand, mining dynamics, and market sentiment. The $100k target represents a significant psychological and technical milestone. Users can trade on different probability outcomes for Bitcoin reaching this price level within the specified timeframe."
  }
];

export const categories = [
  "trending",
  "new", 
  "politics",
  "sports",
  "crypto",
  "earnings",
  "geopolitics",
  "tech",
  "world",
  "economy",
  "elections"
];

export function getMarketsByCategory(category: string): Market[] {
  return markets.filter(market => market.categories.includes(category.toLowerCase()));
}

export function searchMarkets(query: string): Market[] {
  const lowercaseQuery = query.toLowerCase();
  return markets.filter(market => 
    market.title.toLowerCase().includes(lowercaseQuery) ||
    market.description.toLowerCase().includes(lowercaseQuery) ||
    market.categories.some(cat => cat.toLowerCase().includes(lowercaseQuery))
  );
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(1)}K`;
  } else {
    return `$${volume}`;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
