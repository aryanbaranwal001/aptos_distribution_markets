const { db, COLLECTIONS } = require('../src/config/firebase');
const path = require('path');
const fs = require('fs');

// Import markets data from frontend
const marketsDataPath = path.join(__dirname, '../../frontend/src/data/markets.ts');

// Function to extract markets data from TypeScript file
function extractMarketsData() {
  try {
    const fileContent = fs.readFileSync(marketsDataPath, 'utf8');
    
    // Extract the markets array from the TypeScript file
    const marketsMatch = fileContent.match(/export const markets: Market\[\] = (\[[\s\S]*?\]);/);
    if (!marketsMatch) {
      throw new Error('Could not find markets array in markets.ts');
    }
    
    // Convert TypeScript to JSON-compatible format
    let marketsString = marketsMatch[1];
    
    // Remove TypeScript-specific syntax and comments
    marketsString = marketsString
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/(\w+):/g, '"$1":') // Quote property names
      .replace(/'/g, '"'); // Convert single quotes to double quotes
    
    return JSON.parse(marketsString);
  } catch (error) {
    console.error('Error extracting markets data:', error);
    // Fallback to hardcoded data if file parsing fails
    return getFallbackMarketsData();
  }
}

// Fallback markets data
function getFallbackMarketsData() {
  return [
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
    }
    // Add more markets as needed...
  ];
}

// Transform market data for different collections
function transformMarketData(market) {
  const baseData = {
    title: market.title,
    description: market.description,
    volume: market.volume,
    categories: market.categories,
    iconName: market.iconName,
    address: market.address,
    startDate: market.startDate,
    endDate: market.endDate,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Full market data (for detailed views)
  const fullData = {
    ...baseData,
    market_mean: market.market_mean,
    market_mean_min: market.market_mean_min,
    market_mean_max: market.market_mean_max,
    market_standard_deviation: market.market_standard_deviation,
    market_standard_deviation_min: market.market_standard_deviation_min,
    market_standard_deviation_max: market.market_standard_deviation_max,
    min_sigma: market.min_sigma,
    Lambda: market.Lambda,
    peak_p: market.peak_p,
    headroom: market.headroom,
    s: market.s,
    mu_per_one: market.mu_per_one,
    sigma_per_one: market.sigma_per_one,
    x_axis_field_name: market.x_axis_field_name,
    x_axis_short_form: market.x_axis_short_form,
    aicontext: market.aicontext || "" // Include AI context for chat functionality
  };

  // Minimal market data (for list views)
  const minimalData = {
    ...baseData,
    // Include some key fields for search and filtering
    market_mean: market.market_mean,
    market_standard_deviation: market.market_standard_deviation
  };

  return { fullData, minimalData };
}

// Seed the database
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Extract markets data
    const markets = extractMarketsData();
    console.log(`📊 Found ${markets.length} markets to seed`);

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    
    const fullBatch = db.batch();
    const minimalBatch = db.batch();
    
    // Get existing documents to delete
    const [fullSnapshot, minimalSnapshot] = await Promise.all([
      db.collection(COLLECTIONS.MARKETS_FULL).get(),
      db.collection(COLLECTIONS.MARKETS_MINIMAL).get()
    ]);
    
    // Delete existing documents
    fullSnapshot.forEach(doc => {
      fullBatch.delete(doc.ref);
    });
    
    minimalSnapshot.forEach(doc => {
      minimalBatch.delete(doc.ref);
    });
    
    await Promise.all([fullBatch.commit(), minimalBatch.commit()]);
    console.log('✅ Existing data cleared');

    // Seed new data
    console.log('📝 Seeding new data...');
    
    const newFullBatch = db.batch();
    const newMinimalBatch = db.batch();
    
    for (const market of markets) {
      const { fullData, minimalData } = transformMarketData(market);
      
      // Use the market ID as document ID
      const fullRef = db.collection(COLLECTIONS.MARKETS_FULL).doc(market.id);
      const minimalRef = db.collection(COLLECTIONS.MARKETS_MINIMAL).doc(market.id);
      
      newFullBatch.set(fullRef, fullData);
      newMinimalBatch.set(minimalRef, minimalData);
    }
    
    await Promise.all([newFullBatch.commit(), newMinimalBatch.commit()]);
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded ${markets.length} markets`);
    console.log(`🗂️  Collections created:`);
    console.log(`   - ${COLLECTIONS.MARKETS_FULL} (full market data)`);
    console.log(`   - ${COLLECTIONS.MARKETS_MINIMAL} (minimal market data)`);
    
    // Verify the data
    const [fullCount, minimalCount] = await Promise.all([
      db.collection(COLLECTIONS.MARKETS_FULL).count().get(),
      db.collection(COLLECTIONS.MARKETS_MINIMAL).count().get()
    ]);
    
    console.log(`🔍 Verification:`);
    console.log(`   - Full markets: ${fullCount.data().count}`);
    console.log(`   - Minimal markets: ${minimalCount.data().count}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, extractMarketsData };
