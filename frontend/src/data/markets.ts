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
    address: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
    startDate: "2024-01-15T10:00:00Z",
    endDate: "2024-12-31T23:59:59Z"
  },
  {
    id: "2",
    title: "US Presidential Election 2024 Winner",
    description: "Betting market on the outcome of the 2024 United States Presidential Election with real-time odds based on polling data and campaign performance.",
    volume: 15000000,
    categories: ["trending", "politics", "elections"],
    iconName: "election.svg",
    address: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    startDate: "2024-01-01T08:00:00Z",
    endDate: "2024-11-05T23:59:59Z"
  },
  {
    id: "3",
    title: "Will OpenAI release GPT-5 in 2024?",
    description: "Market predicting the release timeline of OpenAI's next major language model, considering development cycles and company announcements.",
    volume: 800000,
    categories: ["trending", "tech"],
    iconName: "ai.svg",
    address: "0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
    startDate: "2024-02-01T12:00:00Z",
    endDate: "2024-12-31T23:59:59Z"
  },
  {
    id: "22",
    title: "Apple Vision Pro Market Adoption Rate",
    description: "Prediction market on Apple Vision Pro achieving 1 million units sold by end of 2024, considering pricing and consumer adoption patterns.",
    volume: 1900000,
    categories: ["trending", "tech"],
    iconName: "apple.svg",
    address: "0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    startDate: "2024-02-15T09:00:00Z",
    endDate: "2024-12-31T23:59:59Z"
  },
  {
    id: "23",
    title: "Global Inflation Peak in 2024",
    description: "Market predicting when global inflation rates will reach their peak in 2024, analyzing central bank policies and economic indicators.",
    volume: 3100000,
    categories: ["trending", "economy"],
    iconName: "inflation.svg",
    address: "0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    startDate: "2024-01-10T14:00:00Z",
    endDate: "2024-12-31T23:59:59Z"
  },
  {
    id: "24",
    title: "SpaceX Mars Mission Timeline",
    description: "Betting market on SpaceX announcing a crewed Mars mission date within the next 2 years, based on current development progress.",
    volume: 2700000,
    categories: ["trending", "tech", "world"],
    iconName: "spacex.svg",
    address: "0x6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    startDate: "2024-03-01T11:00:00Z",
    endDate: "2026-03-01T23:59:59Z"
  },
  {
    id: "25",
    title: "FIFA World Cup 2026 Host Cities",
    description: "Prediction market on which additional cities will be selected as FIFA World Cup 2026 venues beyond the already announced locations.",
    volume: 1600000,
    categories: ["trending", "sports", "world"],
    iconName: "fifa.svg",
    address: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    startDate: "2024-04-01T15:00:00Z",
    endDate: "2025-12-31T23:59:59Z"
  },
  {
    id: "26",
    title: "Cryptocurrency Market Cap Milestone",
    description: "Market predicting if the total cryptocurrency market cap will exceed $3 trillion by the end of 2024, considering adoption and regulation.",
    volume: 4200000,
    categories: ["trending", "crypto", "economy"],
    iconName: "crypto.svg",
    address: "0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567",
    startDate: "2024-01-20T13:00:00Z",
    endDate: "2024-12-31T23:59:59Z"
  },
  {
    id: "27",
    title: "Climate Change COP29 Outcomes",
    description: "Prediction market on key outcomes from the COP29 climate summit, including new emission reduction commitments and funding agreements.",
    volume: 2300000,
    categories: ["trending", "world", "geopolitics"],
    iconName: "climate.svg",
    address: "0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
    startDate: "2024-05-01T10:00:00Z",
    endDate: "2024-11-30T23:59:59Z"
  },

  // New Markets
  {
    id: "4",
    title: "Tesla Q4 2024 Earnings Beat Expectations?",
    description: "Prediction on whether Tesla will exceed analyst expectations for Q4 2024 earnings, factoring in production numbers and market demand.",
    volume: 1200000,
    categories: ["new", "earnings", "tech"],
    iconName: "tesla.svg",
    address: "0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789",
    startDate: "2024-10-01T09:00:00Z",
    endDate: "2025-01-31T23:59:59Z"
  },
  {
    id: "5",
    title: "Will there be a recession in 2025?",
    description: "Economic prediction market analyzing various indicators including inflation, employment rates, and central bank policies.",
    volume: 3500000,
    categories: ["new", "economy"],
    iconName: "recession.svg",
    address: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    startDate: "2024-06-01T12:00:00Z",
    endDate: "2025-12-31T23:59:59Z"
  },

  // Politics Markets
  {
    id: "6",
    title: "UK General Election Date Prediction",
    description: "Market predicting when the next UK General Election will be called, considering political developments and parliamentary dynamics.",
    volume: 950000,
    categories: ["politics", "elections"],
    iconName: "uk-election.svg",
    address: "0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a",
    startDate: "2024-01-05T08:00:00Z",
    endDate: "2025-05-01T23:59:59Z"
  },
  {
    id: "7",
    title: "EU Parliament Composition 2024",
    description: "Prediction market on the political composition of the European Parliament following the 2024 elections.",
    volume: 1800000,
    categories: ["politics", "elections", "world"],
    iconName: "eu-parliament.svg",
    address: "0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-06-09T23:59:59Z"
  },

  // Sports Markets
  {
    id: "8",
    title: "FIFA World Cup 2026 Winner",
    description: "Long-term betting market on which national team will win the 2026 FIFA World Cup, considering current team strengths and development.",
    volume: 5200000,
    categories: ["sports", "world"],
    iconName: "world-cup.svg",
    address: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2026-07-19T23:59:59Z"
  },
  {
    id: "9",
    title: "NBA Championship 2024-25 Season",
    description: "Prediction market for the NBA Championship winner of the 2024-25 season, updated with team performance and player trades.",
    volume: 4100000,
    categories: ["sports"],
    iconName: "nba.svg",
    address: "0xef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
    startDate: "2024-10-01T00:00:00Z",
    endDate: "2025-06-30T23:59:59Z"
  },

  // Crypto Markets
  {
    id: "10",
    title: "Ethereum 2.0 Staking Rewards Rate",
    description: "Market predicting the average staking rewards rate for Ethereum 2.0 validators over the next 12 months.",
    volume: 1600000,
    categories: ["crypto", "tech"],
    iconName: "ethereum.svg",
    address: "0xf1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z"
  },
  {
    id: "11",
    title: "Next Crypto Bull Run Timeline",
    description: "Prediction market on when the next major cryptocurrency bull run will begin, based on market cycles and adoption metrics.",
    volume: 2200000,
    categories: ["crypto", "economy"],
    iconName: "bull-run.svg",
    address: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    startDate: "2024-02-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z"
  },

  // Earnings Markets
  {
    id: "12",
    title: "Apple Q1 2025 Revenue Forecast",
    description: "Market predicting Apple's Q1 2025 revenue figures, considering iPhone sales, services growth, and market conditions.",
    volume: 1800000,
    categories: ["earnings", "tech"],
    iconName: "apple-earnings.svg",
    address: "0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1",
    startDate: "2024-12-01T00:00:00Z",
    endDate: "2025-02-28T23:59:59Z"
  },
  {
    id: "13",
    title: "Amazon AWS Growth Rate 2024",
    description: "Prediction on Amazon Web Services annual growth rate for 2024, factoring in cloud adoption and competition.",
    volume: 1400000,
    categories: ["earnings", "tech"],
    iconName: "aws.svg",
    address: "0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z"
  },

  // Geopolitics Markets
  {
    id: "14",
    title: "China-Taiwan Relations Stability",
    description: "Market assessing the likelihood of maintaining peaceful relations between China and Taiwan over the next 12 months.",
    volume: 2800000,
    categories: ["geopolitics", "world"],
    iconName: "china-taiwan.svg",
    address: "0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z"
  },
  {
    id: "15",
    title: "Russia-Ukraine Conflict Resolution",
    description: "Prediction market on potential resolution timelines for the ongoing conflict, considering diplomatic efforts and military developments.",
    volume: 4500000,
    categories: ["geopolitics", "world"],
    iconName: "ukraine-conflict.svg",
    address: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z"
  },

  // Tech Markets
  {
    id: "16",
    title: "Apple Vision Pro Sales Target",
    description: "Market predicting whether Apple will meet its Vision Pro sales targets for 2024, considering adoption rates and market reception.",
    volume: 1100000,
    categories: ["tech"],
    iconName: "vision-pro.svg",
    address: "0x67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345",
    startDate: "2024-02-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z"
  },
  {
    id: "17",
    title: "Meta's Metaverse Investment ROI",
    description: "Prediction on when Meta's metaverse investments will show positive returns, based on user adoption and revenue generation.",
    volume: 900000,
    categories: ["tech"],
    iconName: "meta.svg",
    address: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2026-12-31T23:59:59Z"
  },

  // World Markets
  {
    id: "18",
    title: "Global Climate Goals Achievement",
    description: "Market predicting the likelihood of achieving key global climate targets set for 2030, considering current progress and policies.",
    volume: 3200000,
    categories: ["world", "geopolitics"],
    iconName: "climate-goals.svg",
    address: "0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2030-12-31T23:59:59Z"
  },
  {
    id: "19",
    title: "Next Country to Join BRICS",
    description: "Prediction market on which country will be the next to join the BRICS economic alliance, considering geopolitical alignments.",
    volume: 1700000,
    categories: ["world", "geopolitics", "economy"],
    iconName: "brics.svg",
    address: "0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2025-12-31T23:59:59Z"
  },

  // Economy Markets
  {
    id: "20",
    title: "Federal Reserve Interest Rate 2024",
    description: "Market predicting the Federal Reserve's interest rate decisions throughout 2024, considering inflation and economic indicators.",
    volume: 6200000,
    categories: ["economy"],
    iconName: "fed-rate.svg",
    address: "0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z"
  },
  {
    id: "21",
    title: "Global Inflation Peak Timing",
    description: "Prediction on when global inflation rates will peak and begin to decline, analyzing various economic factors and central bank policies.",
    volume: 2900000,
    categories: ["economy", "world"],
    iconName: "global-inflation.svg",
    address: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2025-06-30T23:59:59Z"
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
