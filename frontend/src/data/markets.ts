export interface Market {
  id: string;
  title: string;
  description: string;
  volume: number;
  categories: string[];
  iconName: string;
  slug: string;
  isBookmarked?: boolean;
}

export const markets: Market[] = [
  // Trending Markets
  {
    id: "1",
    title: "Will Bitcoin reach $100,000 by end of 2024?",
    description: "Prediction market on Bitcoin's price trajectory considering current market conditions, institutional adoption, and regulatory developments.",
    volume: 2500000,
    categories: ["trending", "crypto"],
    iconName: "bitcoin.svg",
    slug: "will-bitcoin-reach-100-000-by-end-of-2024"
  },
  {
    id: "2",
    title: "US Presidential Election 2024 Winner",
    description: "Betting market on the outcome of the 2024 United States Presidential Election with real-time odds based on polling data and campaign performance.",
    volume: 15000000,
    categories: ["trending", "politics", "elections"],
    iconName: "election.png",
    slug: "us-presidential-election-2024-winner"
  },
  {
    id: "3",
    title: "Will OpenAI release GPT-5 in 2024?",
    description: "Market predicting the release timeline of OpenAI's next major language model, considering development cycles and company announcements.",
    volume: 800000,
    categories: ["trending", "tech"],
    iconName: "ai.svg",
    slug: "will-openai-release-gpt-5-in-2024"
  },
  {
    id: "4",
    title: "Apple Vision Pro Market Adoption Rate",
    description: "Prediction market on Apple Vision Pro achieving 1 million units sold by end of 2024, considering pricing and consumer adoption patterns.",
    volume: 1900000,
    categories: ["trending", "tech"],
    iconName: "vision-pro.png",
    slug: "apple-vision-pro-market-adoption-rate"
  },
  {
    id: "5",
    title: "Global Inflation Peak in 2024",
    description: "Market predicting when global inflation rates will reach their peak in 2024, analyzing central bank policies and economic indicators.",
    volume: 3100000,
    categories: ["trending", "economy"],
    iconName: "inflation.png",
    slug: "global-inflation-peak-in-2024"
  },

  // New Markets
  {
    id: "6",
    title: "Tesla Stock Price Above $300 by Q2 2024",
    description: "Prediction market on Tesla's stock performance considering EV market competition, production targets, and Elon Musk's strategic decisions.",
    volume: 1200000,
    categories: ["new", "earnings"],
    iconName: "tesla.svg",
    slug: "tesla-stock-price-above-300-by-q2-2024"
  },
  {
    id: "7",
    title: "Will there be a recession in 2024?",
    description: "Economic prediction market analyzing GDP growth, unemployment rates, and Federal Reserve policies to forecast recession probability.",
    volume: 4500000,
    categories: ["new", "economy"],
    iconName: "recession.png",
    slug: "will-there-be-a-recession-in-2024"
  },
  {
    id: "8",
    title: "FIFA World Cup 2026 Predictions",
    description: "Betting market on the upcoming FIFA World Cup, considering team performance and qualification scenarios.",
    volume: 900000,
    categories: ["new", "sports"],
    iconName: "fifa.png",
    slug: "fifa-world-cup-2026-predictions"
  },

  // Politics Markets
  {
    id: "9",
    title: "UK General Election Results 2024",
    description: "Comprehensive betting market on UK parliamentary elections, tracking party performance and coalition possibilities.",
    volume: 2800000,
    categories: ["politics", "elections"],
    iconName: "uk-election.png",
    slug: "uk-general-election-results-2024"
  },
  {
    id: "10",
    title: "European Parliament Election Results",
    description: "Continental political market predicting party group compositions and policy direction changes in the European Parliament.",
    volume: 1700000,
    categories: ["politics", "elections"],
    iconName: "eu-parliament.png",
    slug: "european-parliament-election-results"
  },

  // Sports Markets
  {
    id: "11",
    title: "NBA Championship 2024 Winner",
    description: "Basketball championship betting market with real-time odds based on team performance, injuries, and playoff positioning.",
    volume: 8500000,
    categories: ["sports"],
    iconName: "nba.svg",
    slug: "nba-championship-2024-winner"
  },

  // Crypto Markets
  {
    id: "12",
    title: "Ethereum Price Above $5,000 by 2024",
    description: "Cryptocurrency market predicting ETH price movements and network adoption rates following major protocol upgrades.",
    volume: 1800000,
    categories: ["crypto"],
    iconName: "ethereum.png",
    slug: "ethereum-price-above-5000-by-2024"
  },
  {
    id: "13",
    title: "Next Major Cryptocurrency Bull Run",
    description: "Prediction market on which digital asset will lead the next major market rally, analyzing adoption trends and institutional investment.",
    volume: 2100000,
    categories: ["crypto"],
    iconName: "crypto.png",
    slug: "next-major-cryptocurrency-bull-run"
  },

  // Earnings Markets
  {
    id: "14",
    title: "Apple Q4 2024 Revenue Forecast",
    description: "Corporate earnings prediction market for Apple's quarterly performance, considering iPhone sales, services growth, and market conditions.",
    volume: 2700000,
    categories: ["earnings", "tech"],
    iconName: "apple.png",
    slug: "apple-q4-2024-revenue-forecast"
  },

  // Geopolitics Markets
  {
    id: "15",
    title: "China-Taiwan Relations Stability Index",
    description: "Geopolitical prediction market assessing diplomatic tensions and potential conflict scenarios in the Taiwan Strait region.",
    volume: 1100000,
    categories: ["geopolitics", "world"],
    iconName: "china-taiwan.png",
    slug: "china-taiwan-relations-stability-index"
  },
  {
    id: "16",
    title: "Ukraine Conflict Resolution Timeline",
    description: "International relations market tracking diplomatic initiatives and conflict resolution developments in Eastern Europe.",
    volume: 850000,
    categories: ["geopolitics", "world"],
    iconName: "ukraine-conflict.png",
    slug: "ukraine-conflict-resolution-timeline"
  },

  // World Markets
  {
    id: "17",
    title: "Global Climate Goals Achievement 2024",
    description: "Environmental prediction market tracking international climate commitments and carbon emission reduction targets achievement.",
    volume: 2200000,
    categories: ["world", "economy"],
    iconName: "climate-goals.png",
    slug: "global-climate-goals-achievement-2024"
  },

  // Economy Markets
  {
    id: "18",
    title: "Federal Reserve Interest Rate Changes",
    description: "Monetary policy prediction market analyzing Fed decisions based on inflation data, employment statistics, and economic indicators.",
    volume: 5200000,
    categories: ["economy"],
    iconName: "fed-rate.png",
    slug: "federal-reserve-interest-rate-changes"
  }
];

export const categories = [
  'trending',
  'new', 
  'politics',
  'sports',
  'crypto',
  'earnings',
  'geopolitics',
  'tech',
  'world',
  'economy',
  'elections'
];

export const getMarketsByCategory = (category: string): Market[] => {
  if (category === 'trending') {
    return markets.filter(market => market.categories.includes('trending'));
  }
  return markets.filter(market => market.categories.includes(category));
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(0)}K`;
  }
  return `$${volume}`;
};

export const searchMarkets = (query: string): Market[] => {
  const lowercaseQuery = query.toLowerCase();
  return markets.filter(market => 
    market.title.toLowerCase().includes(lowercaseQuery) ||
    market.description.toLowerCase().includes(lowercaseQuery) ||
    market.categories.some(category => category.toLowerCase().includes(lowercaseQuery))
  );
};
