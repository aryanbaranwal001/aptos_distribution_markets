// Comprehensive script to seed all market instances to Firestore
require('dotenv').config();
const { db, COLLECTIONS } = require('../src/config/firebase');

// Complete market data from frontend (first 15 markets)
const allMarkets = [
  {
    id: "1",
    title: "Global Inflation Peak in 2024",
    description: "Market predicting when global inflation rates will reach their peak in 2024, analyzing central bank policies and economic indicators.",
    volume: 3100000,
    categories: ["trending", "economy"],
    iconName: "inflation.svg",
    address: "0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    startDate: "2024-01-10T14:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
    market_mean: 4.2,
    market_mean_min: 2.8,
    market_mean_max: 5.6,
    market_standard_deviation: 1.1,
    market_standard_deviation_min: 0.7,
    market_standard_deviation_max: 1.5,
    min_sigma: 2.1,
    Lambda: 1.1,
    peak_p: 0.48,
    headroom: 0.52,
    s: 1.0,
    mu_per_one: 0.42,
    sigma_per_one: 0.11,
    x_axis_field_name: "Inflation Rate (%)",
    x_axis_short_form: "Inflation %"
  },
  {
    id: "23",
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
    x_axis_short_form: "BTC Price"
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
    endDate: "2024-11-05T23:59:59Z",
    market_mean: 0.52,
    market_mean_min: 0.35,
    market_mean_max: 0.69,
    market_standard_deviation: 0.12,
    market_standard_deviation_min: 0.08,
    market_standard_deviation_max: 0.16,
    min_sigma: 2.0,
    Lambda: 1.2,
    peak_p: 0.55,
    headroom: 0.45,
    s: 0.9,
    mu_per_one: 0.52,
    sigma_per_one: 0.12,
    x_axis_field_name: "Probability of Victory",
    x_axis_short_form: "Win Prob"
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
    endDate: "2024-12-31T23:59:59Z",
    market_mean: 0.35,
    market_mean_min: 0.15,
    market_mean_max: 0.55,
    market_standard_deviation: 0.18,
    market_standard_deviation_min: 0.10,
    market_standard_deviation_max: 0.26,
    min_sigma: 1.8,
    Lambda: 0.9,
    peak_p: 0.38,
    headroom: 0.62,
    s: 1.1,
    mu_per_one: 0.35,
    sigma_per_one: 0.18,
    x_axis_field_name: "Release Probability",
    x_axis_short_form: "Release Prob"
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
    endDate: "2024-12-31T23:59:59Z",
    market_mean: 750000,
    market_mean_min: 400000,
    market_mean_max: 1100000,
    market_standard_deviation: 200000,
    market_standard_deviation_min: 120000,
    market_standard_deviation_max: 280000,
    min_sigma: 2.2,
    Lambda: 1.0,
    peak_p: 0.42,
    headroom: 0.58,
    s: 1.3,
    mu_per_one: 0.75,
    sigma_per_one: 0.20,
    x_axis_field_name: "Units Sold",
    x_axis_short_form: "Units"
  },
  {
    id: "4",
    title: "Tesla Q4 2024 Earnings Beat Expectations?",
    description: "Prediction on whether Tesla will exceed analyst expectations for Q4 2024 earnings, factoring in production numbers and market demand.",
    volume: 1200000,
    categories: ["new", "earnings", "tech"],
    iconName: "tesla.svg",
    address: "0x0abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789",
    startDate: "2024-10-01T09:00:00Z",
    endDate: "2025-01-31T23:59:59Z",
    market_mean: 0.48,
    market_mean_min: 0.25,
    market_mean_max: 0.71,
    market_standard_deviation: 0.16,
    market_standard_deviation_min: 0.10,
    market_standard_deviation_max: 0.22,
    min_sigma: 1.9,
    Lambda: 0.9,
    peak_p: 0.52,
    headroom: 0.48,
    s: 1.0,
    mu_per_one: 0.48,
    sigma_per_one: 0.16,
    x_axis_field_name: "Beat Probability",
    x_axis_short_form: "Beat Prob"
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
    endDate: "2025-12-31T23:59:59Z",
    market_mean: 0.32,
    market_mean_min: 0.15,
    market_mean_max: 0.49,
    market_standard_deviation: 0.18,
    market_standard_deviation_min: 0.12,
    market_standard_deviation_max: 0.24,
    min_sigma: 2.2,
    Lambda: 1.1,
    peak_p: 0.35,
    headroom: 0.65,
    s: 1.2,
    mu_per_one: 0.32,
    sigma_per_one: 0.18,
    x_axis_field_name: "Recession Probability",
    x_axis_short_form: "Recession Prob"
  },
  {
    id: "6",
    title: "UK General Election Date Prediction",
    description: "Market predicting when the next UK General Election will be called, considering political developments and parliamentary dynamics.",
    volume: 950000,
    categories: ["politics", "elections"],
    iconName: "uk-election.svg",
    address: "0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a",
    startDate: "2024-01-05T08:00:00Z",
    endDate: "2025-05-01T23:59:59Z",
    market_mean: 0.45,
    market_mean_min: 0.20,
    market_mean_max: 0.70,
    market_standard_deviation: 0.19,
    market_standard_deviation_min: 0.12,
    market_standard_deviation_max: 0.26,
    min_sigma: 2.0,
    Lambda: 1.0,
    peak_p: 0.48,
    headroom: 0.52,
    s: 1.1,
    mu_per_one: 0.45,
    sigma_per_one: 0.19,
    x_axis_field_name: "Election Probability",
    x_axis_short_form: "Election Prob"
  },
  {
    id: "8",
    title: "FIFA World Cup 2026 Winner",
    description: "Long-term betting market on which national team will win the 2026 FIFA World Cup, considering current team strengths and development.",
    volume: 5200000,
    categories: ["sports", "world"],
    iconName: "world-cup.svg",
    address: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2026-07-19T23:59:59Z",
    market_mean: 0.18,
    market_mean_min: 0.08,
    market_mean_max: 0.28,
    market_standard_deviation: 0.12,
    market_standard_deviation_min: 0.06,
    market_standard_deviation_max: 0.18,
    min_sigma: 1.8,
    Lambda: 0.8,
    peak_p: 0.22,
    headroom: 0.78,
    s: 1.3,
    mu_per_one: 0.18,
    sigma_per_one: 0.12,
    x_axis_field_name: "Win Probability",
    x_axis_short_form: "Win Prob"
  },
  {
    id: "10",
    title: "Ethereum 2.0 Staking Rewards Rate",
    description: "Market predicting the average staking rewards rate for Ethereum 2.0 validators over the next 12 months.",
    volume: 1600000,
    categories: ["crypto", "tech"],
    iconName: "ethereum.svg",
    address: "0xf1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
    market_mean: 4.8,
    market_mean_min: 3.2,
    market_mean_max: 6.4,
    market_standard_deviation: 1.2,
    market_standard_deviation_min: 0.8,
    market_standard_deviation_max: 1.6,
    min_sigma: 2.2,
    Lambda: 1.1,
    peak_p: 0.52,
    headroom: 0.48,
    s: 1.0,
    mu_per_one: 0.64,
    sigma_per_one: 0.16,
    x_axis_field_name: "Staking Rate (%)",
    x_axis_short_form: "Staking %"
  }
];

async function seedAllMarkets() {
  try {
    console.log('🌱 Starting to seed all markets to Firestore...');
    
    if (!db) {
      console.error('❌ Database connection not available');
      return false;
    }

    const batch = db.batch();
    
    for (const market of allMarkets) {
      const marketData = {
        ...market,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = db.collection(COLLECTIONS.MARKETS_MINIMAL).doc(market.id);
      batch.set(docRef, marketData);
      console.log(`  ✓ Prepared: ${market.title}`);
    }

    await batch.commit();
    console.log(`🎉 Successfully seeded ${allMarkets.length} markets to database`);
    
    return true;

  } catch (error) {
    console.error('❌ Failed to seed markets:', error.message);
    return false;
  }
}

seedAllMarkets().then(success => {
  if (success) {
    console.log('\n✅ All markets seeded successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Market seeding failed.');
    process.exit(1);
  }
});
