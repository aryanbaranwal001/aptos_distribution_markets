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
    iconName: "election.svg",
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
    id: "22",
    title: "Apple Vision Pro Market Adoption Rate",
    description: "Prediction market on Apple Vision Pro achieving 1 million units sold by end of 2024, considering pricing and consumer adoption patterns.",
    volume: 1900000,
    categories: ["trending", "tech"],
    iconName: "apple.svg",
    slug: "apple-vision-pro-market-adoption-rate"
  },
  {
    id: "23",
    title: "Global Inflation Peak in 2024",
    description: "Market predicting when global inflation rates will reach their peak in 2024, analyzing central bank policies and economic indicators.",
    volume: 3100000,
    categories: ["trending", "economy"],
    iconName: "inflation.svg",
    slug: "global-inflation-peak-in-2024"
  },

  // New Markets
  {
    id: "4",
    title: "Tesla Stock Price Above $300 by Q2 2024",
    description: "Prediction market on Tesla's stock performance considering EV market competition, production targets, and Elon Musk's strategic decisions.",
    volume: 1200000,
    categories: ["new", "earnings"],
    iconName: "tesla.svg",
    slug: "tesla-stock-price-above-300-by-q2-2024"
  },
  {
    id: "5",
    title: "Will there be a recession in 2024?",
    description: "Economic prediction market analyzing GDP growth, unemployment rates, and Federal Reserve policies to forecast recession probability.",
    volume: 4500000,
    categories: ["new", "economy"],
    iconName: "recession.svg",
    slug: "will-there-be-a-recession-in-2024"
  },
  {
    id: "6",
    title: "Next FIFA World Cup Host Country",
    description: "Betting market on the selection process for future FIFA World Cup hosting rights, considering geopolitical and infrastructure factors.",
    volume: 900000,
    categories: ["new", "sports"],
    iconName: "fifa.svg",
    slug: "next-fifa-world-cup-host-country"
  },

  // Politics Markets
  {
    id: "7",
    title: "UK General Election Results 2024",
    description: "Comprehensive betting market on UK parliamentary elections, tracking party performance and coalition possibilities.",
    volume: 2800000,
    categories: ["politics", "elections"],
    iconName: "uk-flag.svg",
    slug: "uk-general-election-results-2024"
  },
  {
    id: "8",
    title: "European Union Expansion in 2024",
    description: "Political prediction market on potential new EU member states, considering accession negotiations and referendum outcomes.",
    volume: 650000,
    categories: ["politics", "geopolitics"],
    iconName: "eu-flag.svg",
    slug: "european-union-expansion-in-2024"
  },

  // Sports Markets
  {
    id: "9",
    title: "Super Bowl 2024 Winner",
    description: "NFL championship betting market with real-time odds based on team performance, injuries, and playoff positioning.",
    volume: 8500000,
    categories: ["sports"],
    iconName: "nfl.svg",
    slug: "super-bowl-2024-winner"
  },
  {
    id: "10",
    title: "Olympics 2024 Medal Count Leader",
    description: "Summer Olympics prediction market forecasting which country will top the medal table based on athlete performance and historical data.",
    volume: 3200000,
    categories: ["sports"],
    iconName: "olympics.svg",
    slug: "olympics-2024-medal-count-leader"
  },

  // Crypto Markets
  {
    id: "11",
    title: "Ethereum 2.0 Staking Rewards Rate",
    description: "Cryptocurrency market predicting ETH staking yields and network participation rates following major protocol upgrades.",
    volume: 1800000,
    categories: ["crypto"],
    iconName: "ethereum.svg",
    slug: "ethereum-2-0-staking-rewards-rate"
  },
  {
    id: "12",
    title: "Next Cryptocurrency to Reach $1 Trillion Market Cap",
    description: "Prediction market on which digital asset will achieve trillion-dollar valuation, analyzing adoption trends and institutional investment.",
    volume: 2100000,
    categories: ["crypto"],
    iconName: "crypto-market.svg",
    slug: "next-cryptocurrency-to-reach-1-trillion-market-cap"
  },

  // Earnings Markets
  {
    id: "13",
    title: "Apple Q4 2024 Revenue Forecast",
    description: "Corporate earnings prediction market for Apple's quarterly performance, considering iPhone sales, services growth, and market conditions.",
    volume: 2700000,
    categories: ["earnings", "tech"],
    iconName: "apple.svg",
    slug: "apple-q4-2024-revenue-forecast"
  },
  {
    id: "14",
    title: "Amazon Prime Membership Growth Rate",
    description: "Market predicting Amazon's subscriber growth trajectory, analyzing competitive streaming landscape and e-commerce trends.",
    volume: 1600000,
    categories: ["earnings", "tech"],
    iconName: "amazon.svg",
    slug: "amazon-prime-membership-growth-rate"
  },

  // Geopolitics Markets
  {
    id: "15",
    title: "China-Taiwan Relations Stability Index",
    description: "Geopolitical prediction market assessing diplomatic tensions and potential conflict scenarios in the Taiwan Strait region.",
    volume: 1100000,
    categories: ["geopolitics", "world"],
    iconName: "china-taiwan.svg",
    slug: "china-taiwan-relations-stability-index"
  },
  {
    id: "16",
    title: "Middle East Peace Agreement Progress",
    description: "International relations market tracking diplomatic initiatives and peace process developments in the Middle East region.",
    volume: 850000,
    categories: ["geopolitics", "world"],
    iconName: "peace.svg",
    slug: "middle-east-peace-agreement-progress"
  },

  // Tech Markets
  {
    id: "17",
    title: "Autonomous Vehicle Deployment Timeline",
    description: "Technology adoption market predicting when fully autonomous vehicles will achieve widespread commercial deployment.",
    volume: 1950000,
    categories: ["tech"],
    iconName: "autonomous-car.svg",
    slug: "autonomous-vehicle-deployment-timeline"
  },
  {
    id: "18",
    title: "Quantum Computing Breakthrough Date",
    description: "Scientific prediction market on quantum supremacy milestones and practical quantum computing applications timeline.",
    volume: 1300000,
    categories: ["tech"],
    iconName: "quantum.svg",
    slug: "quantum-computing-breakthrough-date"
  },

  // World Markets
  {
    id: "19",
    title: "Global Climate Agreement Compliance",
    description: "Environmental prediction market tracking international climate commitments and carbon emission reduction targets achievement.",
    volume: 2200000,
    categories: ["world", "economy"],
    iconName: "climate.svg",
    slug: "global-climate-agreement-compliance"
  },
  {
    id: "20",
    title: "World Population Milestone Timing",
    description: "Demographic prediction market forecasting when global population will reach specific milestones based on current growth trends.",
    volume: 750000,
    categories: ["world"],
    iconName: "population.svg",
    slug: "world-population-milestone-timing"
  },

  // Economy Markets
  {
    id: "21",
    title: "Federal Reserve Interest Rate Changes",
    description: "Monetary policy prediction market analyzing Fed decisions based on inflation data, employment statistics, and economic indicators.",
    volume: 5200000,
    categories: ["economy"],
    iconName: "fed.svg",
    slug: "federal-reserve-interest-rate-changes"
  },

  // Elections Markets
  {
    id: "24",
    title: "Indian General Election Outcome 2024",
    description: "Democratic process prediction market covering the world's largest election, analyzing party coalitions and voter sentiment.",
    volume: 3800000,
    categories: ["elections", "politics"],
    iconName: "india-flag.svg",
    slug: "indian-general-election-outcome-2024"
  },
  {
    id: "25",
    title: "European Parliament Election Results",
    description: "Continental political market predicting party group compositions and policy direction changes in the European Parliament.",
    volume: 1700000,
    categories: ["elections", "politics"],
    iconName: "eu-parliament.svg",
    slug: "european-parliament-election-results"
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
