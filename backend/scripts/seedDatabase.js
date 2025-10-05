const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env') // adjust the relative path to your .env
});
const { db, COLLECTIONS } = require('../src/config/firebase');


const fs = require('fs');
const { markets } = require('../../frontend/src/data/markets.ts');

// Function to extract markets data from TypeScript file
function extractMarketsData() {
  return markets;
}

// Transform market data for different collections
function transformMarketData(market) {
  const minimalData = {
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
    ...minimalData,
    market_mean: market.market_mean,
    market_mean_deviation: market.market_mean_deviation,
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
